import { useMeditationTimer } from '@/contexts/MeditationTimerContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeditationTimerDisplayProps {
  variant?: 'full' | 'minimal';
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function MeditationTimerDisplay({ variant = 'minimal' }: MeditationTimerDisplayProps) {
  const {
    isRunning,
    isPaused,
    remainingSeconds,
    pauseTimer,
    resumeTimer,
    stopTimer,
  } = useMeditationTimer();

  // Don't render if timer is not active
  if (!isRunning && remainingSeconds === 0) {
    return null;
  }

  const isCompleted = remainingSeconds === 0;

  if (variant === 'minimal') {
    return (
      <div 
        className="fixed bottom-20 right-4 z-40 animate-fade-in"
        role="timer"
        aria-label={`Meditation timer: ${formatTime(remainingSeconds)} remaining`}
      >
        <div 
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full",
            "bg-background/80 backdrop-blur-sm border border-border shadow-lg",
            "transition-all duration-300",
            isCompleted && "ring-2 ring-primary/50 bg-primary/10"
          )}
        >
          {/* Timer display */}
          <span 
            className={cn(
              "font-mono text-lg tabular-nums min-w-[4ch]",
              isPaused && "opacity-60",
              isCompleted && "text-primary"
            )}
          >
            {formatTime(remainingSeconds)}
          </span>

          {/* Pause/Resume button */}
          {!isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={isPaused ? resumeTimer : pauseTimer}
              aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Stop button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={stopTimer}
            aria-label="Stop timer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Full variant (for future use)
  return (
    <div 
      className="flex flex-col items-center justify-center p-8 rounded-xl bg-muted/50 border border-border"
      role="timer"
      aria-label={`Meditation timer: ${formatTime(remainingSeconds)} remaining`}
    >
      <span className="font-mono text-5xl tabular-nums text-foreground">
        {formatTime(remainingSeconds)}
      </span>
      
      <div className="flex items-center gap-4 mt-6">
        {!isCompleted && (
          <Button
            variant="outline"
            size="lg"
            onClick={isPaused ? resumeTimer : pauseTimer}
            aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? (
              <>
                <Play className="h-5 w-5 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            )}
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="lg"
          onClick={stopTimer}
          aria-label="Stop timer"
        >
          <X className="h-5 w-5 mr-2" />
          Stop
        </Button>
      </div>
    </div>
  );
}
