import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TRANSITION_TIMINGS } from '@/lib/transitionTimings';

interface PhaseProgressProps {
  currentPhase: number;
  totalPhases: number;
  phaseNames: string[];
}

export function PhaseProgress({ currentPhase, totalPhases, phaseNames }: PhaseProgressProps) {
  const [animatedPhase, setAnimatedPhase] = useState(currentPhase);
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Animate the progress when phase changes
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedPhase(currentPhase);
      return;
    }

    // Trigger pulse animation on current indicator
    setIsPulsing(true);
    
    // Smoothly animate to new phase
    const timer = setTimeout(() => {
      setAnimatedPhase(currentPhase);
    }, TRANSITION_TIMINGS.progressFill / 2);

    // End pulse after animation completes
    const pulseTimer = setTimeout(() => {
      setIsPulsing(false);
    }, TRANSITION_TIMINGS.pulseDuration);

    return () => {
      clearTimeout(timer);
      clearTimeout(pulseTimer);
    };
  }, [currentPhase, prefersReducedMotion]);

  const progressWidth = ((animatedPhase + 1) / totalPhases) * 100;

  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between mb-2">
        {phaseNames.map((name, index) => (
          <div
            key={name}
            className={cn(
              "flex flex-col items-center transition-opacity",
              prefersReducedMotion ? "duration-0" : "duration-300",
              index <= currentPhase ? "opacity-100" : "opacity-40"
            )}
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                prefersReducedMotion ? "duration-0" : "duration-300",
                index < currentPhase && "bg-primary",
                index === currentPhase && "bg-primary",
                index === currentPhase && isPulsing && !prefersReducedMotion && "ring-4 ring-primary/30 scale-125",
                index === currentPhase && !isPulsing && "ring-4 ring-primary/20",
                index > currentPhase && "bg-muted-foreground/30"
              )}
            />
            <span className={cn(
              "hidden md:block text-xs mt-2 text-muted-foreground font-body transition-all",
              prefersReducedMotion ? "duration-0" : "duration-300",
              index === currentPhase && "text-foreground font-medium"
            )}>
              {name}
            </span>
          </div>
        ))}
      </div>
      
      {/* Progress bar with smooth fill */}
      <div className="relative h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute left-0 top-0 h-full bg-primary rounded-full",
            prefersReducedMotion ? "transition-none" : "transition-all duration-500 ease-out"
          )}
          style={{ width: `${progressWidth}%` }}
        />
        
        {/* Subtle glow effect at the leading edge */}
        {!prefersReducedMotion && (
          <div
            className={cn(
              "absolute top-0 h-full w-4 rounded-full transition-all duration-500 ease-out",
              "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
              isPulsing && "opacity-100",
              !isPulsing && "opacity-0"
            )}
            style={{ left: `calc(${progressWidth}% - 8px)` }}
          />
        )}
      </div>
    </div>
  );
}
