import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Timer, Pause, Play, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';

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
  
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chimePlayedRef = useRef(false);
  const elapsedRef = useRef(0);

  // Initialize timer
  useEffect(() => {
    if (!state?.duration) {
      navigate('/');
      return;
    }
    
    const seconds = state.duration * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
  }, [state, navigate]);

  // Timer countdown
  useEffect(() => {
    if (remainingSeconds > 0 && !isPaused && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          elapsedRef.current = totalSeconds - prev + 1;
          
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsComplete(true);
            
            if (!chimePlayedRef.current) {
              chimePlayedRef.current = true;
              playChime();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [remainingSeconds, isPaused, totalSeconds]);

  // Save meditation time when leaving
  const handleExit = async () => {
    if (state?.sessionId && elapsedRef.current > 0) {
      try {
        await db.updateSessionMeditation(state.sessionId, elapsedRef.current);
      } catch (err) {
        console.error('Failed to save meditation time:', err);
      }
    }
    navigate('/');
  };

  const togglePause = () => setIsPaused(prev => !prev);

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Exit button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4"
        onClick={handleExit}
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="text-center max-w-md w-full space-y-8">
        {/* Timer Circle */}
        <div className="relative mx-auto w-48 h-48">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "font-mono text-4xl tabular-nums",
              isComplete && "text-primary"
            )}>
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl text-foreground">
            {isComplete ? 'Meditation Complete' : isPaused ? 'Paused' : 'Rest in Stillness'}
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            {isComplete 
              ? 'May this peace remain with you.' 
              : 'Be still, and know that I am God.'}
          </p>
        </div>

        {/* Generated prayer (scrollable) */}
        {state.generatedPrayer && (
          <div className="bg-muted/30 rounded-xl p-4 border border-border/50 max-h-32 overflow-y-auto text-left">
            <p className="font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {state.generatedPrayer}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isComplete && (
            <Button
              variant="outline"
              size="lg"
              onClick={togglePause}
              className="w-32"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          )}
          
          <Button
            size="lg"
            onClick={handleExit}
            className="w-32"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
