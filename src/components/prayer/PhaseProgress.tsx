import { cn } from '@/lib/utils';

interface PhaseProgressProps {
  currentPhase: number;
  totalPhases: number;
  phaseNames: string[];
}

export function PhaseProgress({ currentPhase, totalPhases, phaseNames }: PhaseProgressProps) {
  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between mb-2">
        {phaseNames.map((name, index) => (
          <div
            key={name}
            className={cn(
              "flex flex-col items-center",
              index <= currentPhase ? "opacity-100" : "opacity-40"
            )}
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index < currentPhase && "bg-primary",
                index === currentPhase && "bg-primary ring-4 ring-primary/20",
                index > currentPhase && "bg-muted-foreground/30"
              )}
            />
            <span className="hidden md:block text-xs mt-2 text-muted-foreground font-body">
              {name}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentPhase + 1) / totalPhases) * 100}%` }}
        />
      </div>
    </div>
  );
}
