import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrayerPhase } from '@/lib/prayerData';
import { useRecurringRequests } from '@/hooks/usePrayerRequests';
import { useCreateSession, useUpdateSessionPrayer } from '@/hooks/usePrayerSessions';
import { useSaveSessionTopics } from '@/hooks/usePrayerTopics';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useMeditationTimer } from '@/contexts/MeditationTimerContext';
import { useDonor } from '@/contexts/DonorContext';
import { PrayerFormat } from '@/hooks/usePrayerFormats';
import { builtInFormats } from '@/lib/builtInFormats';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/db';
import { PhaseProgress } from '@/components/prayer/PhaseProgress';
import { PhaseCard } from '@/components/prayer/PhaseCard';
import { FormatSelector } from '@/components/prayer/FormatSelector';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, CheckCircle, Repeat, Loader2, Sparkles, Copy, Check, RefreshCw, AlertCircle, Timer, Lock, FileText, ChevronDown, Gift } from 'lucide-react';
import { TOTAL_TRANSITION_TIME } from '@/lib/transitionTimings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePrayerSession, GENERATION_COOLDOWN_MS } from '@/hooks/usePrayerSession';

export default function Pray() {
  const navigate = useNavigate();

  // Use the consolidated state hook
  const { state, actions } = usePrayerSession();
  const {
    selectedFormat,
    currentPhaseIndex,
    phaseContent,
    skippedPhases,
    isComplete,
    saveError,
    isGenerating,
    generatedPrayer,
    copied,
    savedSessionId,
    personalPrayer,
    selectedDuration,
    isSavingPersonal,
    showPhaseNotes,
    lastGeneratedAt,
    remainingGenerations,
    dailyLimit,
  } = state;

  // Track if transition is in progress to prevent double-clicks
  const isTransitioning = useRef(false);

  // Global audio - just for user interaction handling
  const { handleUserInteraction } = useGlobalAudio();

  // Meditation timer settings (for default duration)
  const { isDonor } = useDonor();
  const { defaultDuration } = useMeditationTimer();

  // Update duration when defaultDuration changes
  if (defaultDuration && selectedDuration !== defaultDuration && !isComplete) {
    actions.setDuration(defaultDuration);
  }

  const { data: recurringRequests = [] } = useRecurringRequests();
  const createSessionMutation = useCreateSession();
  const updateSessionPrayerMutation = useUpdateSessionPrayer();
  const saveTopicsMutation = useSaveSessionTopics();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Get the active phases - from selected format or default to Lord's Prayer (first built-in)
  const activePhases: PrayerPhase[] = selectedFormat?.phases || builtInFormats[0].phases;
  const currentPhase = activePhases[currentPhaseIndex];
  const phaseNames = activePhases.map((p) => p.name);

  // Handle format change - reset phase index and content when format changes
  const handleFormatChange = useCallback((format: PrayerFormat | null) => {
    actions.setFormat(format);
  }, [actions]);

  // Handle exit - MUST be defined before any early returns
  const handleExit = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleContentChange = useCallback((value: string) => {
    actions.setPhaseContent(currentPhase.id, value);
  }, [currentPhase.id, actions]);

  const handleCopy = useCallback(async () => {
    if (generatedPrayer) {
      await navigator.clipboard.writeText(generatedPrayer);
      actions.setCopied(true);
      setTimeout(() => actions.setCopied(false), 2000);
      toast.success('Prayer copied to clipboard');
    }
  }, [generatedPrayer, actions]);

  const handleNext = useCallback(() => {
    if (isTransitioning.current) return;

    if (currentPhaseIndex < activePhases.length - 1) {
      isTransitioning.current = true;
      actions.nextPhase();

      // Reset transition lock after animation completes
      setTimeout(() => {
        isTransitioning.current = false;
      }, prefersReducedMotion ? 0 : TOTAL_TRANSITION_TIME);
    }
  }, [currentPhaseIndex, activePhases.length, prefersReducedMotion, actions]);

  const handleSkip = useCallback(() => {
    if (isTransitioning.current) return;

    if (currentPhaseIndex < activePhases.length - 1) {
      isTransitioning.current = true;
      actions.skipPhase(currentPhase.id);

      // Reset transition lock after animation completes
      setTimeout(() => {
        isTransitioning.current = false;
      }, prefersReducedMotion ? 0 : TOTAL_TRANSITION_TIME);
    }
  }, [currentPhaseIndex, activePhases.length, prefersReducedMotion, currentPhase.id, actions]);

  const generatePrayer = async () => {
    if (!savedSessionId) return;

    // Check if daily limit reached (client-side check)
    if (remainingGenerations !== null && remainingGenerations <= 0) {
      const message = isDonor
        ? "Daily limit reached. Try again tomorrow!"
        : "Daily limit reached. Upgrade to donor for more generations!";
      toast.error(message);
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastGeneratedAt < GENERATION_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((GENERATION_COOLDOWN_MS - (now - lastGeneratedAt)) / 1000);
      toast.error(`Please wait ${remainingSeconds} seconds before generating again`);
      return;
    }

    actions.startGenerating();
    try {
      const { data, error } = await supabase.functions.invoke('generate-prayer', {
        body: { phases: phaseContent },
      });

      if (error) {
        toast.error('Could not generate prayer. Please try again.');
        actions.generationError();
        return;
      }

      // Handle rate limit response (429)
      if (data?.error) {
        toast.error(data.error);
        actions.generationError(data.remaining, data.limit);
        return;
      }

      actions.generationSuccess(data.prayer, data.remaining, data.limit);
      toast.success('Prayer generated');

      // Save the generated prayer to the session
      try {
        await updateSessionPrayerMutation.mutateAsync({
          sessionId: savedSessionId,
          generatedPrayer: data.prayer,
        });
      } catch {
        // Non-critical - prayer was still generated
      }
    } catch {
      toast.error('Could not generate prayer. Please try again.');
      actions.generationError();
    }
  };

  const handleComplete = async () => {
    actions.clearSaveError();

    try {
      const session = await createSessionMutation.mutateAsync({
        phases: phaseContent,
        formatId: selectedFormat?.id,
      });
      actions.setComplete(session.id);

      // Initialize duration from user preference
      if (defaultDuration) {
        actions.setDuration(defaultDuration);
      }

      // Save prayer topics for session memory (non-blocking)
      saveTopicsMutation.mutate({ sessionId: session.id, phases: phaseContent });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save your prayer session';
      actions.setSaveError(message);
      toast.error(message);
    }
  };

  const handleRetry = useCallback(() => {
    handleComplete();
  }, [phaseContent, selectedFormat, createSessionMutation, saveTopicsMutation]);

  // Wrapper functions for PhaseCard that handle the complete case
  const handleNextOrComplete = useCallback(() => {
    if (currentPhaseIndex >= activePhases.length - 1) {
      handleComplete();
    } else {
      handleNext();
    }
  }, [currentPhaseIndex, activePhases.length, handleNext, phaseContent, selectedFormat]);

  const handleSkipOrComplete = useCallback(() => {
    if (currentPhaseIndex >= activePhases.length - 1) {
      handleComplete();
    } else {
      handleSkip();
    }
  }, [currentPhaseIndex, activePhases.length, handleSkip, phaseContent, selectedFormat]);

  // Handle return home - save personal prayer if entered
  const handleReturnHome = async () => {
    if (personalPrayer.trim() && savedSessionId) {
      actions.setSavingPersonal(true);
      try {
        await db.updateSessionPersonalPrayer(savedSessionId, personalPrayer.trim());
      } catch {
        // Non-critical - continue navigation
      } finally {
        actions.setSavingPersonal(false);
      }
    }
    navigate('/');
  };

  // Handle begin meditation
  const handleBeginMeditation = async () => {
    // Save personal prayer first if entered
    if (personalPrayer.trim() && savedSessionId) {
      try {
        await db.updateSessionPersonalPrayer(savedSessionId, personalPrayer.trim());
      } catch {
        // Non-critical - continue to meditation
      }
    }

    navigate('/pray/meditate', {
      state: {
        duration: selectedDuration,
        sessionId: savedSessionId,
        generatedPrayer: generatedPrayer || undefined,
        personalPrayer: personalPrayer.trim() || undefined,
      }
    });
  };

  if (isComplete) {
    // Build phase notes for display
    const phaseNotes = activePhases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      content: phaseContent[phase.id] || '',
    }));

    return (
      <div className="page-background flex flex-col p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="relative z-10 text-center mb-6 pt-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 shadow-glow">
            <CheckCircle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl text-foreground tracking-wide">Amen</h1>
          <p className="text-muted-foreground font-body mt-1 leading-relaxed">
            Your prayer session is complete. May peace be with you.
          </p>
        </div>

        {/* Phase Notes Reference (Collapsible) */}
        <div className="relative z-10 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Collapsible open={showPhaseNotes} onOpenChange={actions.togglePhaseNotes}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Your Phase Notes
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  showPhaseNotes && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-4 rounded-lg bg-muted/20 border border-border space-y-4 max-h-[300px] overflow-y-auto">
                {phaseNotes.map((phase) => (
                  <div key={phase.id}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      {phase.name}
                    </p>
                    {phase.content ? (
                      <p className="text-sm whitespace-pre-wrap text-foreground">
                        {phase.content}
                      </p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">No notes</p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* AI Generated Prayer Section - Conditional */}
        <div className="relative z-10 mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {generatedPrayer ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">AI-Generated Prayer</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-muted-foreground"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generatePrayer}
                    disabled={isGenerating || (remainingGenerations !== null && remainingGenerations <= 0)}
                    className="text-muted-foreground"
                  >
                    <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 max-h-[200px] overflow-y-auto">
                <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {generatedPrayer}
                </p>
              </div>
              {/* Show remaining generations */}
              {remainingGenerations !== null && dailyLimit !== null && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {remainingGenerations}/{dailyLimit} generations remaining today
                </p>
              )}
            </>
          ) : remainingGenerations !== null && remainingGenerations <= 0 ? (
            // Show upgrade prompt when limit reached
            <div className="p-4 rounded-lg bg-muted/10 border border-dashed border-border">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Daily limit reached</p>
                  <p className="text-sm text-muted-foreground">
                    {isDonor 
                      ? "You've used all 10 generations today. Try again tomorrow!"
                      : "You've used all 5 free generations today."}
                  </p>
                </div>
              </div>
              {!isDonor && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/donate')}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Upgrade for 10 Daily Generations
                </Button>
              )}
            </div>
          ) : (
            <div>
              <Button 
                variant="outline" 
                className="w-full py-6"
                onClick={generatePrayer}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating prayer...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Prayer from Your Notes
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Optional – creates a flowing prayer from your phase reflections
                {remainingGenerations !== null && dailyLimit !== null && (
                  <> • {remainingGenerations}/{dailyLimit} remaining today</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Personal Prayer Section */}
        <div className="relative z-10 mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Add Your Own Words</span>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>
          <Textarea
            placeholder="Write your own prayers and reflections..."
            value={personalPrayer}
            onChange={(e) => actions.setPersonalPrayer(e.target.value)}
            className="min-h-[100px] resize-y"
          />
        </div>

        {/* Meditation Section - donor only */}
        <div className="relative z-10 mb-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          {isDonor ? (
            <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Timer className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Continue in Meditation</h3>
                  <p className="text-sm text-muted-foreground">
                    Spend quiet time reflecting on your prayer.
                  </p>
                </div>
              </div>
              
              {/* Duration selector */}
              <div className="flex gap-2 flex-wrap mb-3">
                {[5, 10, 15, 20, 30].map((min) => (
                  <Button
                    key={min}
                    variant={selectedDuration === min ? "default" : "outline"}
                    size="sm"
                    onClick={() => actions.setDuration(min)}
                  >
                    {min} min
                  </Button>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleBeginMeditation}
              >
                Begin Meditation
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted/10 border border-dashed border-border">
              <div className="flex items-center gap-3 opacity-60">
                <Timer className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Meditation Timer</p>
                  <p className="text-sm text-muted-foreground">Available with a donation</p>
                </div>
                <Lock className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>

        {/* Return Home Button */}
        <div className="relative z-10 mt-auto pt-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleReturnHome}
            disabled={isSavingPersonal}
          >
            {isSavingPersonal ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Return Home'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Save error state - show retry option
  if (saveError && !createSessionMutation.isPending) {
    return (
      <div className="page-background flex items-center justify-center p-4">
        <Card className="p-6 md:p-8 text-center space-y-6 max-w-lg w-full animate-fade-in">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-foreground">Unable to Save</h2>
            <p className="text-muted-foreground font-body">
              {saveError}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} size="lg" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} size="lg" className="w-full">
              Return Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }


  return (
    <div 
      className="page-background relative"
      onClick={handleUserInteraction}
      onKeyDown={handleUserInteraction}
    >
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-border/30">
        <Button variant="ghost" size="icon" onClick={handleExit}>
          <X className="w-5 h-5" />
        </Button>
        <FormatSelector 
          selectedFormat={selectedFormat} 
          onSelectFormat={handleFormatChange} 
        />
        <GlobalAudioButton />
      </header>

      {/* Progress */}
      <div className="relative z-10 py-4">
        <PhaseProgress
          currentPhase={currentPhaseIndex}
          totalPhases={activePhases.length}
          phaseNames={phaseNames}
        />
      </div>

      {/* Phase Content */}
      <main className="relative z-10 px-4 py-6 max-w-lg mx-auto">
        {/* Show recurring requests in the Practical Needs phase */}
        {currentPhase.id === 'needs' && recurringRequests.length > 0 && (
          <div className={cn(
            "mb-6 p-4 bg-muted/50 rounded-xl border border-border/50",
            "transition-opacity duration-300",
            prefersReducedMotion ? "duration-0" : "duration-300"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="w-4 h-4 text-primary" />
              <span className="text-sm font-body text-foreground font-medium">
                Your Ongoing Requests
              </span>
            </div>
            <ul className="space-y-2">
              {recurringRequests.map((req) => (
                <li key={req.id} className="text-sm text-muted-foreground font-body">
                  • {req.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <PhaseCard
          key={currentPhase.id}
          phase={currentPhase}
          value={phaseContent[currentPhase.id] || ''}
          onChange={handleContentChange}
          onNext={handleNextOrComplete}
          onSkip={handleSkipOrComplete}
          isLast={currentPhaseIndex === activePhases.length - 1}
          wasSkipped={skippedPhases.has(currentPhase.id)}
        />

        {createSessionMutation.isPending && (
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-body">Saving your prayer...</span>
          </div>
        )}
      </main>
    </div>
  );
}
