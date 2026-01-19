import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pause, Play, X, Plus, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { toast } from '@/hooks/use-toast';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Generate a gentle chime using Web Audio API
const playChime = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 528 Hz - known as the "love frequency" / healing tone
    oscillator.frequency.value = 528;
    oscillator.type = 'sine';
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
    
    oscillator.start(now);
    oscillator.stop(now + 2.5);
    
    setTimeout(() => audioContext.close(), 3000);
  } catch (err) {
    console.warn('Could not play chime:', err);
  }
};

interface MeditateState {
  duration: number;
  sessionId: string;
  generatedPrayer?: string;
  personalPrayer?: string;
}

export default function Meditate() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as MeditateState | null;
  
  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // UI state
  const [showPrayer, setShowPrayer] = useState(false);
  
  // Track actual meditation time
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chimePlayedRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Computed
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  // Redirect if no state
  useEffect(() => {
    if (!state?.duration || !state?.sessionId) {
      toast({
        title: "Invalid session",
        description: "Please start meditation from a prayer session",
        variant: "destructive"
      });
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  // Initialize timer
  useEffect(() => {
    if (!state?.duration) return;
    
    const seconds = state.duration * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
  }, [state?.duration]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || isPaused || isComplete || remainingSeconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Timer complete
          setIsComplete(true);
          setIsRunning(false);
          
          if (!chimePlayedRef.current) {
            chimePlayedRef.current = true;
            playChime();
          }
          return 0;
        }
        return prev - 1;
      });
      
      // Track elapsed time
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, isComplete, remainingSeconds]);

  // Wake lock - prevent screen from dimming
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isRunning && !isPaused) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake lock not supported or failed:', err);
      }
    };

    if (isRunning && !isPaused) {
      requestWakeLock();
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isRunning, isPaused]);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning && !isComplete) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, isComplete]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleAddMoreTime = useCallback(() => {
    setRemainingSeconds((prev) => prev + 300); // Add 5 minutes
    setTotalSeconds((prev) => prev + 300);
    setIsComplete(false);
    setIsRunning(true);
    chimePlayedRef.current = false;
    toast({
      title: "Time added",
      description: "5 minutes added to your meditation"
    });
  }, []);

  const handleExit = useCallback(() => {
    if (isRunning && !isComplete) {
      if (!confirm('Exit meditation? Your meditation time will not be saved.')) {
        return;
      }
    }
    navigate('/');
  }, [isRunning, isComplete, navigate]);

  const handleFinish = useCallback(async () => {
    if (!state?.sessionId) {
      navigate('/');
      return;
    }

    try {
      // Save meditation time to the session
      await db.updateSessionMeditation(state.sessionId, elapsedSeconds);
      
      toast({
        title: "Meditation complete",
        description: "Peace be with you."
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to save meditation time:', error);
      toast({
        title: "Could not save",
        description: "Meditation time could not be saved",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [state?.sessionId, elapsedSeconds, navigate]);

  if (!state) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Top bar - minimal */}
      <div className="flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleExit}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Exit
        </Button>
        <span className="text-sm text-muted-foreground font-body">
          Meditation
        </span>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Timer display - large and central */}
        <div className="mb-8 text-center">
          <div 
            className={cn(
              "text-6xl md:text-8xl font-mono tabular-nums font-light tracking-tight transition-colors duration-500",
              isComplete && "text-primary"
            )}
            role="timer"
            aria-live="polite"
            aria-label={`${Math.floor(remainingSeconds / 60)} minutes ${remainingSeconds % 60} seconds remaining`}
          >
            {formatTime(remainingSeconds)}
          </div>
          
          {/* Progress indicator */}
          <div className="mt-6 w-48 mx-auto h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Status text */}
        <p className="text-muted-foreground mb-8 font-body text-center">
          {isComplete 
            ? "Take all the time you need" 
            : isPaused 
              ? "Paused" 
              : "Breathe and reflect"
          }
        </p>

        {/* Timer controls */}
        <div className="flex items-center gap-4">
          {!isComplete && (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={isPaused ? handleResume : handlePause}
              aria-label={isPaused ? "Resume meditation" : "Pause meditation"}
            >
              {isPaused 
                ? <Play className="h-6 w-6" /> 
                : <Pause className="h-6 w-6" />
              }
            </Button>
          )}
          
          {isComplete && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleAddMoreTime}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add 5 minutes
            </Button>
          )}
        </div>
      </div>

      {/* Prayer reference - collapsible at bottom */}
      {(state.generatedPrayer || state.personalPrayer) && (
        <div className="p-4">
          <Collapsible open={showPrayer} onOpenChange={setShowPrayer}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-muted-foreground"
              >
                <span className="text-sm font-body">
                  {showPrayer ? "Hide prayer" : "View your prayer"}
                </span>
                <ChevronUp className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  !showPrayer && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-accordion-down">
              <div className="mt-2 p-4 rounded-lg bg-muted/20 max-h-[30vh] overflow-y-auto">
                {state.generatedPrayer && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground font-body">
                    {state.generatedPrayer}
                  </p>
                )}
                {state.personalPrayer && (
                  <>
                    {state.generatedPrayer && <hr className="my-3 border-border" />}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground italic font-body">
                      {state.personalPrayer}
                    </p>
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Finish button - always visible at bottom */}
      <div className="p-4 pt-0">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleFinish}
        >
          {isComplete ? "Finish Session" : "End Early"}
        </Button>
      </div>
    </div>
  );
}
