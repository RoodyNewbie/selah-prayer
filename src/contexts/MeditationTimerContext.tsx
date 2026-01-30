import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDonor } from '@/contexts/DonorContext';
import { toast } from 'sonner';
import { playMeditationChime } from '@/lib/audioUtils';

interface MeditationTimerContextType {
  // Settings (from database)
  isEnabled: boolean;
  defaultDuration: number; // in minutes
  setEnabled: (enabled: boolean) => Promise<void>;
  setDefaultDuration: (minutes: number) => Promise<void>;

  // Active timer state (in-memory, during prayer session)
  isRunning: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  totalSeconds: number;

  // Timer controls
  startTimer: (durationMinutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;

  // Loading state
  isLoading: boolean;
}

const MeditationTimerContext = createContext<MeditationTimerContextType | undefined>(undefined);

export function MeditationTimerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isDonor } = useDonor();
  
  // Settings state (persisted)
  const [isEnabled, setIsEnabled] = useState(false);
  const [defaultDuration, setDefaultDurationState] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  
  // Active timer state (in-memory)
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  
  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chimePlayedRef = useRef(false);

  // Fetch settings on mount
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('meditation_timer_enabled, meditation_timer_duration')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setIsEnabled(data.meditation_timer_enabled);
          setDefaultDurationState(data.meditation_timer_duration);
        }
      } catch (err) {
        console.error('Error fetching timer settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playChime = useCallback(() => {
    playMeditationChime();
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            // Timer completed
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setIsRunning(false);
            
            // Play chime only once
            if (!chimePlayedRef.current) {
              chimePlayedRef.current = true;
              playChime();
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, playChime]);

  const setEnabled = async (enabled: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ meditation_timer_enabled: enabled })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsEnabled(enabled);
      toast.success('Timer settings saved');
    } catch (err) {
      console.error('Error saving timer enabled:', err);
      toast.error('Failed to save settings');
    }
  };

  const setDefaultDuration = async (minutes: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ meditation_timer_duration: minutes })
        .eq('user_id', user.id);

      if (error) throw error;

      setDefaultDurationState(minutes);
      toast.success('Timer settings saved');
    } catch (err) {
      console.error('Error saving timer duration:', err);
      toast.error('Failed to save settings');
    }
  };

  const startTimer = useCallback((durationMinutes?: number) => {
    const duration = durationMinutes ?? defaultDuration;
    const seconds = duration * 60;
    
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(true);
    setIsPaused(false);
    chimePlayedRef.current = false;
  }, [defaultDuration]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const seconds = defaultDuration * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(true);
    setIsPaused(false);
    chimePlayedRef.current = false;
  }, [defaultDuration]);

  return (
    <MeditationTimerContext.Provider
      value={{
        isEnabled: isDonor ? isEnabled : false,
        defaultDuration,
        setEnabled,
        setDefaultDuration,
        isRunning,
        isPaused,
        remainingSeconds,
        totalSeconds,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
        isLoading,
      }}
    >
      {children}
    </MeditationTimerContext.Provider>
  );
}

export function useMeditationTimer() {
  const context = useContext(MeditationTimerContext);
  if (context === undefined) {
    throw new Error('useMeditationTimer must be used within a MeditationTimerProvider');
  }
  return context;
}
