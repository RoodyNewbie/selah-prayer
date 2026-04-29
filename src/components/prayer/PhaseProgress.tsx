import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TRANSITION_TIMINGS } from '@/lib/transitionTimings';
import { Sigil, isKnownSigil } from '@/components/design/Sigil';

interface PhaseProgressProps {
  currentPhase: number;
  totalPhases: number;
  phaseNames: string[];
  phaseIds?: string[];
}

export function PhaseProgress({
  currentPhase,
  totalPhases,
  phaseNames,
  phaseIds,
}: PhaseProgressProps) {
  const [animatedPhase, setAnimatedPhase] = useState(currentPhase);
  const [isPulsing, setIsPulsing] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedPhase(currentPhase);
      return;
    }

    setIsPulsing(true);
    const fillTimer = setTimeout(
      () => setAnimatedPhase(currentPhase),
      TRANSITION_TIMINGS.progressFill / 2
    );
    const pulseTimer = setTimeout(() => setIsPulsing(false), TRANSITION_TIMINGS.pulseDuration);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(pulseTimer);
    };
  }, [currentPhase, prefersReducedMotion]);

  const useSigils =
    Array.isArray(phaseIds) &&
    phaseIds.length === totalPhases &&
    phaseIds.every((id) => isKnownSigil(id));

  return (
    <div className="w-full" role="progressbar" aria-valuemin={1} aria-valuemax={totalPhases} aria-valuenow={currentPhase + 1}>
      <div className="flex items-center px-1">
        {Array.from({ length: totalPhases }).map((_, index) => {
          const isDone = index < animatedPhase;
          const isCurrent = index === animatedPhase;
          const isFuture = index > animatedPhase;
          const phaseId = phaseIds?.[index];
          const phaseName = phaseNames[index] ?? `Phase ${index + 1}`;

          return (
            <div key={phaseName + index} className="flex items-center flex-1 last:flex-none">
              {/* Marker */}
              <div
                title={phaseName}
                className={cn(
                  'relative flex items-center justify-center rounded-full flex-shrink-0',
                  'transition-all ease-breath',
                  prefersReducedMotion ? 'duration-0' : 'duration-breath',
                  isCurrent ? 'w-8 h-8' : 'w-6 h-6',
                  isDone && 'bg-primary',
                  !isDone && 'bg-transparent',
                  isCurrent && 'ring-[3px] ring-primary/22',
                  isCurrent && isPulsing && !prefersReducedMotion && 'ring-primary/30',
                  isCurrent && 'border border-primary',
                  isFuture && 'border border-muted-foreground/35'
                )}
              >
                {useSigils && phaseId ? (
                  <Sigil
                    phase={phaseId}
                    size={isCurrent ? 14 : 11}
                    strokeWidth={isDone ? 2 : 1.5}
                    className={cn(
                      'transition-colors ease-breath',
                      prefersReducedMotion ? 'duration-0' : 'duration-breath',
                      isDone && 'text-primary-foreground',
                      isCurrent && 'text-primary',
                      isFuture && 'text-muted-foreground/60'
                    )}
                  />
                ) : (
                  <span
                    className={cn(
                      'rounded-full',
                      isCurrent ? 'w-2 h-2 bg-primary' : 'w-1.5 h-1.5',
                      isDone && 'bg-primary-foreground',
                      isFuture && 'bg-muted-foreground/40'
                    )}
                  />
                )}
              </div>

              {/* Connector */}
              {index < totalPhases - 1 && (
                <div
                  className={cn(
                    'flex-1 mx-1.5 h-[1.5px] rounded-full',
                    'transition-colors ease-breath',
                    prefersReducedMotion ? 'duration-0' : 'duration-breath',
                    index < animatedPhase ? 'bg-primary' : 'bg-muted-foreground/25'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="hidden md:block mt-2 text-center text-xs text-muted-foreground/85 font-body">
        {phaseNames[currentPhase] ?? `Phase ${currentPhase + 1}`}
      </p>
    </div>
  );
}
