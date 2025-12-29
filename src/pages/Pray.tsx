import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { prayerPhases } from '@/lib/prayerData';
import { useRecurringRequests } from '@/hooks/usePrayerRequests';
import { useCreateSession, useUpdateSessionPrayer } from '@/hooks/usePrayerSessions';
import { supabase } from '@/integrations/supabase/client';
import { PhaseProgress } from '@/components/prayer/PhaseProgress';
import { PhaseCard } from '@/components/prayer/PhaseCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, CheckCircle, Repeat, Loader2, Sparkles, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Pray() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseContent, setPhaseContent] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrayer, setGeneratedPrayer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const { data: recurringRequests = [] } = useRecurringRequests();
  const createSessionMutation = useCreateSession();
  const updateSessionPrayerMutation = useUpdateSessionPrayer();

  const currentPhase = prayerPhases[currentPhaseIndex];
  const phaseNames = prayerPhases.map((p) => p.name);

  const handleNext = () => {
    if (currentPhaseIndex < prayerPhases.length - 1) {
      setCurrentPhaseIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentPhaseIndex < prayerPhases.length - 1) {
      setCurrentPhaseIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const generatePrayer = async (phases: Record<string, string>, sessionId: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prayer', {
        body: { phases },
      });

      if (error) {
        console.error('Error generating prayer:', error);
        toast({
          title: 'Could not generate prayer',
          description: 'Your session was saved, but we couldn\'t create a flowing prayer.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.error) {
        toast({
          title: 'Prayer generation issue',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setGeneratedPrayer(data.prayer);
      
      // Save the generated prayer to the session
      try {
        await updateSessionPrayerMutation.mutateAsync({
          sessionId,
          generatedPrayer: data.prayer,
        });
      } catch (saveErr) {
        console.error('Error saving generated prayer:', saveErr);
        // Non-critical - prayer is displayed, just not persisted
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = async () => {
    setSaveError(null);
    
    try {
      const session = await createSessionMutation.mutateAsync({ phases: phaseContent });
      setSavedSessionId(session.id);
      setIsComplete(true);
      
      // Generate the flowing prayer
      const hasContent = Object.values(phaseContent).some((v) => v && v.trim());
      if (hasContent) {
        generatePrayer(phaseContent, session.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save your prayer session';
      setSaveError(message);
      toast({
        title: 'Error saving prayer',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleRetry = () => {
    handleComplete();
  };

  const handleContentChange = (value: string) => {
    setPhaseContent((prev) => ({
      ...prev,
      [currentPhase.id]: value,
    }));
  };

  const handleCopy = async () => {
    if (generatedPrayer) {
      await navigator.clipboard.writeText(generatedPrayer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Prayer copied',
        description: 'The prayer has been copied to your clipboard.',
      });
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 md:p-8 text-center space-y-6 max-w-lg w-full animate-fade-in">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-foreground">Amen</h2>
            <p className="text-muted-foreground font-body">
              Your prayer has been saved. May peace be with you.
            </p>
          </div>

          {/* Generated Prayer Section */}
          {isGenerating && (
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
              <Sparkles className="w-5 h-5 animate-pulse text-primary" />
              <span className="font-body text-sm">Crafting your prayer...</span>
            </div>
          )}

          {generatedPrayer && !isGenerating && (
            <div className="text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-body font-medium text-foreground">
                    Your Prayer
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-muted-foreground"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border/50 max-h-64 overflow-y-auto">
                <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {generatedPrayer}
                </p>
              </div>
            </div>
          )}

          <Button onClick={() => navigate('/')} size="lg" className="w-full">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  // Save error state - show retry option
  if (saveError && !createSessionMutation.isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <X className="w-5 h-5" />
        </Button>
        <span className="font-display text-lg text-foreground">Prayer Session</span>
        <div className="w-10" />
      </header>

      {/* Progress */}
      <div className="py-4">
        <PhaseProgress
          currentPhase={currentPhaseIndex}
          totalPhases={prayerPhases.length}
          phaseNames={phaseNames}
        />
      </div>

      {/* Phase Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Show recurring requests in the Practical Needs phase */}
        {currentPhase.id === 'needs' && recurringRequests.length > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border/50">
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
          onNext={handleNext}
          onSkip={handleSkip}
          isLast={currentPhaseIndex === prayerPhases.length - 1}
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
