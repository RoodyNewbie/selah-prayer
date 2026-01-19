import { useMeditationTimer } from '@/contexts/MeditationTimerContext';
import { useDonor } from '@/contexts/DonorContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Timer, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const DURATION_OPTIONS = [5, 10, 15, 30];

export function MeditationTimerSettings() {
  const { isDonor } = useDonor();
  const { 
    isEnabled, 
    defaultDuration, 
    setEnabled, 
    setDefaultDuration,
    isLoading 
  } = useMeditationTimer();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 opacity-60">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Timer className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-body font-medium text-foreground">Meditation Timer</p>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn("flex items-center justify-between", !isDonor && "opacity-60")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Timer className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-body font-medium text-foreground">Enable Timer</p>
              {!isDonor && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">Show timer during prayer phases</p>
          </div>
        </div>
        {isDonor ? (
          <Switch
            checked={isEnabled}
            onCheckedChange={setEnabled}
            aria-label="Toggle meditation timer"
          />
        ) : null}
      </div>

      {/* Duration Selection (only visible when enabled and is donor) */}
      {isDonor && isEnabled && (
        <div className="pt-4 border-t border-border space-y-3">
          <label className="text-sm font-medium text-foreground">Default Duration</label>
          <div className="flex gap-2 flex-wrap">
            {DURATION_OPTIONS.map((minutes) => (
              <Button
                key={minutes}
                variant={defaultDuration === minutes ? "default" : "outline"}
                size="sm"
                onClick={() => setDefaultDuration(minutes)}
              >
                {minutes} min
              </Button>
            ))}
          </div>
        </div>
      )}

      {!isDonor && (
        <p className="text-sm text-muted-foreground">
          Set a gentle timer for your prayer sessions.
        </p>
      )}
    </div>
  );
}
