import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type AudioTrack = 'silence' | 'rain' | 'piano';

export interface AudioSettings {
  track: AudioTrack;
  volume: number; // 0-100
  enabled: boolean; // Whether audio should play globally
}

interface AudioContextType {
  settings: AudioSettings;
  isPlaying: boolean;
  changeTrack: (track: AudioTrack) => void;
  changeVolume: (volume: number) => void;
  toggleEnabled: () => void;
  setEnabled: (enabled: boolean) => void;
  handleUserInteraction: () => void;
}

const STORAGE_KEY = 'selah_audio_settings';
const FADE_IN_DURATION = 2000;
const FADE_OUT_DURATION = 1500;
const FADE_INTERVAL = 50;

const AUDIO_SOURCES: Record<Exclude<AudioTrack, 'silence'>, string> = {
  rain: '/audio/rain_thunder.mp3',
  piano: '/audio/ambient_piano.mp3',
};

const defaultSettings: AudioSettings = {
  track: 'silence',
  volume: 50,
  enabled: false,
};

function getStoredSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        track: parsed.track || 'silence',
        volume: typeof parsed.volume === 'number' ? parsed.volume : 50,
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
      };
    }
  } catch (e) {
    console.error('Failed to parse audio settings:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save audio settings:', e);
  }
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(getStoredSettings);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const targetVolumeRef = useRef<number>(settings.volume / 100);
  const hasUserInteractedRef = useRef(false);

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Clear any ongoing fade
  const clearFade = useCallback(() => {
    if (fadeIntervalRef.current !== null) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  // Fade volume to target
  const fadeVolume = useCallback((
    audio: HTMLAudioElement,
    targetVolume: number,
    duration: number,
    onComplete?: () => void
  ) => {
    clearFade();

    if (prefersReducedMotion || duration === 0) {
      audio.volume = targetVolume;
      onComplete?.();
      return;
    }

    const startVolume = audio.volume;
    const volumeDiff = targetVolume - startVolume;
    const steps = duration / FADE_INTERVAL;
    const volumeStep = volumeDiff / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      const newVolume = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep));
      audio.volume = newVolume;

      if (currentStep >= steps) {
        clearFade();
        audio.volume = targetVolume;
        onComplete?.();
      }
    }, FADE_INTERVAL);
  }, [clearFade, prefersReducedMotion]);

  // Start playing audio
  const startAudio = useCallback(async (track: Exclude<AudioTrack, 'silence'>) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(AUDIO_SOURCES[track]);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    audio.addEventListener('error', (e) => {
      console.error('Audio failed to load:', e);
      setIsPlaying(false);
    });

    try {
      await audio.play();
      setIsPlaying(true);
      fadeVolume(audio, targetVolumeRef.current, FADE_IN_DURATION);
    } catch (err) {
      // Autoplay blocked - will retry on user interaction
      console.log('Autoplay blocked, waiting for user interaction');
      hasUserInteractedRef.current = false;
    }
  }, [fadeVolume]);

  // Stop playing audio with fade
  const stopAudio = useCallback((immediate = false) => {
    const audio = audioRef.current;
    if (!audio) {
      setIsPlaying(false);
      return;
    }

    if (immediate || prefersReducedMotion) {
      clearFade();
      audio.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    fadeVolume(audio, 0, FADE_OUT_DURATION, () => {
      audio.pause();
      audioRef.current = null;
      setIsPlaying(false);
    });
  }, [fadeVolume, clearFade, prefersReducedMotion]);

  // Change track
  const changeTrack = useCallback((newTrack: AudioTrack) => {
    const newSettings = { ...settings, track: newTrack };
    setSettings(newSettings);
    saveSettings(newSettings);

    if (!settings.enabled) return;

    if (newTrack === 'silence') {
      stopAudio();
    } else if (audioRef.current) {
      // Fade out current, then start new
      stopAudio();
      setTimeout(() => {
        if (settings.enabled) {
          startAudio(newTrack);
        }
      }, prefersReducedMotion ? 0 : FADE_OUT_DURATION);
    } else {
      startAudio(newTrack);
    }
  }, [settings, stopAudio, startAudio, prefersReducedMotion]);

  // Change volume
  const changeVolume = useCallback((newVolume: number) => {
    const newSettings = { ...settings, volume: newVolume };
    setSettings(newSettings);
    saveSettings(newSettings);
    targetVolumeRef.current = newVolume / 100;

    if (audioRef.current && isPlaying) {
      audioRef.current.volume = newVolume / 100;
    }
  }, [settings, isPlaying]);

  // Toggle enabled
  const toggleEnabled = useCallback(() => {
    const newEnabled = !settings.enabled;
    const newSettings = { ...settings, enabled: newEnabled };
    setSettings(newSettings);
    saveSettings(newSettings);

    if (newEnabled && settings.track !== 'silence') {
      hasUserInteractedRef.current = true;
      startAudio(settings.track);
    } else if (!newEnabled) {
      stopAudio();
    }
  }, [settings, startAudio, stopAudio]);

  // Set enabled directly
  const setEnabled = useCallback((enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    saveSettings(newSettings);

    if (enabled && settings.track !== 'silence') {
      hasUserInteractedRef.current = true;
      startAudio(settings.track);
    } else if (!enabled) {
      stopAudio();
    }
  }, [settings, startAudio, stopAudio]);

  // Handle user interaction for autoplay unlock
  const handleUserInteraction = useCallback(() => {
    if (hasUserInteractedRef.current) return;
    hasUserInteractedRef.current = true;

    if (settings.enabled && settings.track !== 'silence' && !isPlaying && !audioRef.current) {
      startAudio(settings.track);
    }
  }, [settings.enabled, settings.track, isPlaying, startAudio]);

  // Start/stop based on enabled state
  useEffect(() => {
    if (settings.enabled && settings.track !== 'silence') {
      hasUserInteractedRef.current = true;
      startAudio(settings.track);
    } else if (!settings.enabled || settings.track === 'silence') {
      stopAudio();
    }

    return () => {
      // Don't stop on cleanup - we want audio to persist
    };
  }, []); // Only run on mount

  // Update target volume ref when settings change
  useEffect(() => {
    targetVolumeRef.current = settings.volume / 100;
  }, [settings.volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearFade();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [clearFade]);

  return (
    <AudioContext.Provider
      value={{
        settings,
        isPlaying,
        changeTrack,
        changeVolume,
        toggleEnabled,
        setEnabled,
        handleUserInteraction,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useGlobalAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useGlobalAudio must be used within an AudioProvider');
  }
  return context;
}
