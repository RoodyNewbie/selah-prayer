import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { phaseScriptures, getRandomScripture, PhaseScripture } from '@/lib/phaseScriptures';
import { cn } from '@/lib/utils';

interface PhaseScriptureCardProps {
  phaseId: string;
  className?: string;
}

const FADE_DURATION = 200;

export function PhaseScriptureCard({ phaseId, className }: PhaseScriptureCardProps) {
  const [currentScripture, setCurrentScripture] = useState<PhaseScripture | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isFading, setIsFading] = useState(false);
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Initialize with a random scripture when phase changes
  useEffect(() => {
    const result = getRandomScripture(phaseId);
    if (result) {
      setCurrentScripture(result.scripture);
      setCurrentIndex(result.index);
    } else {
      setCurrentScripture(null);
      setCurrentIndex(-1);
    }
  }, [phaseId]);

  // Handle refresh - get a different scripture
  const handleRefresh = useCallback(() => {
    const scriptures = phaseScriptures[phaseId];
    if (!scriptures || scriptures.length <= 1) return;

    if (prefersReducedMotion) {
      // Instant change for reduced motion
      const result = getRandomScripture(phaseId, currentIndex);
      if (result) {
        setCurrentScripture(result.scripture);
        setCurrentIndex(result.index);
      }
      return;
    }

    // Fade out
    setIsFading(true);
    
    setTimeout(() => {
      // Get new scripture and fade in
      const result = getRandomScripture(phaseId, currentIndex);
      if (result) {
        setCurrentScripture(result.scripture);
        setCurrentIndex(result.index);
      }
      setIsFading(false);
    }, FADE_DURATION);
  }, [phaseId, currentIndex, prefersReducedMotion]);

  // Don't render if no scriptures for this phase
  if (!currentScripture) return null;

  const hasMultipleScriptures = (phaseScriptures[phaseId]?.length ?? 0) > 1;

  return (
    <div className={cn("text-center px-1 py-1 space-y-1", className)}>
      <div 
        className={cn(
          "transition-opacity",
          prefersReducedMotion ? "duration-0" : "duration-200",
          isFading ? "opacity-0" : "opacity-100"
        )}
      >
        <p className="text-muted-foreground font-body text-[0.96rem] leading-relaxed italic">
          "{currentScripture.text}"
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-primary font-body text-xs font-medium tracking-wide">
            — {currentScripture.reference}
          </p>
          {hasMultipleScriptures && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-primary"
              onClick={handleRefresh}
              aria-label="Get a different scripture"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
