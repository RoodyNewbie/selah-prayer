import { useEffect, useState, useRef, useCallback } from 'react';
import { PrayerPhase } from '@/lib/prayerData';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronRight, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRANSITION_TIMINGS } from '@/lib/transitionTimings';
import { PhaseScriptureCard } from './PhaseScriptureCard';

interface PhaseCardProps {
  phase: PrayerPhase;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
}

const phaseColors: Record<string, string> = {
  praise: 'bg-phase-praise',
  will: 'bg-phase-will',
  needs: 'bg-phase-needs',
  forgiveness: 'bg-phase-forgive',
  protection: 'bg-phase-protect',
  worship: 'bg-phase-worship',
};

type TransitionState = 'visible' | 'fading-out' | 'paused' | 'fading-in';

export function PhaseCard({
  phase,
  value,
  onChange,
  onNext,
  onSkip,
  isLast,
}: PhaseCardProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [transitionState, setTransitionState] = useState<TransitionState>('fading-in');
  const [showHeader, setShowHeader] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showScripture, setShowScripture] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingAction = useRef<'next' | 'skip' | null>(null);
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Stagger in the content elements
  const staggerIn = useCallback(() => {
    if (prefersReducedMotion) {
      // Instant show for reduced motion
      setShowHeader(true);
      setShowPrompt(true);
      setShowScripture(true);
      setShowContent(true);
      setTransitionState('visible');
      textareaRef.current?.focus();
      return;
    }

    const { staggerDelay, fadeIn } = TRANSITION_TIMINGS;
    
    // Header appears first
    setShowHeader(true);
    
    // Prompt appears after header
    setTimeout(() => setShowPrompt(true), staggerDelay);
    
    // Scripture appears after prompt
    setTimeout(() => setShowScripture(true), staggerDelay * 2);
    
    // Content (textarea + buttons) appears after scripture
    setTimeout(() => setShowContent(true), staggerDelay * 3);
    
    // Mark as fully visible and focus textarea
    setTimeout(() => {
      setTransitionState('visible');
      textareaRef.current?.focus();
    }, fadeIn + staggerDelay * 3);
  }, [prefersReducedMotion]);

  // Handle phase change - trigger entrance animation
  useEffect(() => {
    setCurrentPromptIndex(Math.floor(Math.random() * phase.prompts.length));
    
    // Reset visibility states
    setShowHeader(false);
    setShowPrompt(false);
    setShowScripture(false);
    setShowContent(false);
    
    if (prefersReducedMotion) {
      staggerIn();
    } else {
      // Start fade in after a brief moment
      setTransitionState('fading-in');
      // Small delay to ensure CSS transition triggers
      requestAnimationFrame(() => {
        staggerIn();
      });
    }
  }, [phase.id, staggerIn, prefersReducedMotion]);

  // Handle transition to next/skip
  const handleTransition = (action: 'next' | 'skip') => {
    if (transitionState !== 'visible') return;
    
    pendingAction.current = action;
    
    if (prefersReducedMotion) {
      // Instant transition for reduced motion
      if (action === 'next') {
        onNext();
      } else {
        onSkip();
      }
      return;
    }

    const { fadeOut, pauseBetween } = TRANSITION_TIMINGS;
    
    // Start fade out
    setTransitionState('fading-out');
    
    // After fade out, pause briefly
    setTimeout(() => {
      setTransitionState('paused');
      
      // After pause, trigger the actual navigation
      setTimeout(() => {
        if (pendingAction.current === 'next') {
          onNext();
        } else {
          onSkip();
        }
        pendingAction.current = null;
      }, pauseBetween);
    }, fadeOut);
  };

  const handleNext = () => handleTransition('next');
  const handleSkipClick = () => handleTransition('skip');

  // Opacity and transform based on transition state
  const getContentStyles = (isVisible: boolean, translateY = true) => {
    const base = 'transition-all ease-out';
    const duration = prefersReducedMotion ? 'duration-0' : 'duration-500';
    
    if (transitionState === 'fading-out' || transitionState === 'paused') {
      return cn(base, duration, 'opacity-0', translateY && 'translate-y-2');
    }
    
    if (!isVisible) {
      return cn(base, duration, 'opacity-0', translateY && 'translate-y-3');
    }
    
    return cn(base, duration, 'opacity-100 translate-y-0');
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className={cn("text-center space-y-3", getContentStyles(showHeader))}>
        <div className="flex items-center justify-center gap-3">
          <div
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              phaseColors[phase.id] || "bg-primary"
            )}
          />
          <h2 className="font-display text-2xl md:text-3xl text-foreground">
            {phase.name}
          </h2>
        </div>
        <p className="text-muted-foreground font-body text-sm">
          {phase.description}
        </p>
      </div>

      {/* Prompt */}
      <div className={cn(
        "bg-muted/50 rounded-xl p-5 border border-border/50",
        getContentStyles(showPrompt)
      )}>
        <p className="font-display text-lg text-foreground italic text-center">
          "{phase.prompts[currentPromptIndex]}"
        </p>
      </div>

      {/* Scripture - Using curated scriptures from phaseScriptures */}
      <div className={getContentStyles(showScripture)}>
        <PhaseScriptureCard phaseId={phase.id} />
      </div>

      {/* Text Area */}
      <div className={getContentStyles(showContent, false)}>
        <Textarea
          ref={textareaRef}
          placeholder="Write your thoughts here... (optional)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[180px]"
          disabled={transitionState !== 'visible'}
        />
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center justify-between gap-3",
        getContentStyles(showContent, false)
      )}>
        <Button 
          variant="ghost" 
          onClick={handleSkipClick} 
          className="text-muted-foreground"
          disabled={transitionState !== 'visible'}
        >
          <SkipForward className="w-4 h-4 mr-1" />
          Skip
        </Button>
        <Button 
          onClick={handleNext} 
          size="lg"
          disabled={transitionState !== 'visible'}
        >
          {isLast ? 'Finish' : 'Continue'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
