import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSignedAudioUrl } from '@/hooks/useCustomAudioTracks';
import {
  type AudioTrack,
  type AudioSettings,
  AUDIO_SOURCES,
  FADE_IN_DURATION,
  FADE_OUT_DURATION,
  getStoredAudioSettings,
  saveAudioSettings,
  isCustomTrackId,
  createFadeController,
  fadeVolume as sharedFadeVolume,
  prefersReducedMotion,
} from '@/lib/audioUtils';

// Re-export types for backwards compatibility
export type { AudioTrack, AudioSettings };

export interface CustomTrackInfo {
  id: string;
  name: string;
  filePath: string;
}

interface AudioContextType {
  settings: AudioSettings;
  isPlaying: boolean;
  changeTrack: (track: AudioTrack, customTrackPath?: string) => void;
  changeVolume: (volume: number) => void;
  toggleEnabled: () => void;
  setEnabled: (enabled: boolean) => void;
  handleUserInteraction: () => void;
  playCustomTrack: (track: CustomTrackInfo) => void;
  isCustomTrack: (track: AudioTrack) => boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(getStoredAudioSettings);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeControllerRef = useRef(createFadeController());
  const targetVolumeRef = useRef<number>(settings.volume / 100);
  const hasUserInteractedRef = useRef(false);

  const reducedMotion = prefersReducedMotion();

  // Wrapper for fadeVolume that uses our controller
  const fadeVolume = useCallback((
    audio: HTMLAudioElement,
    targetVolume: number,
    duration: number,
    onComplete?: () => void
  ) => {
    sharedFadeVolume(audio, targetVolume, duration, fadeControllerRef.current, onComplete);
  }, []);

  // Start playing audio from URL
  const startAudioFromUrl = useCallback(async (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      setIsPlaying(false);
    });

    try {
      await audio.play();
      setIsPlaying(true);
      fadeVolume(audio, targetVolumeRef.current, FADE_IN_DURATION);
    } catch {
      // Autoplay blocked - will retry on user interaction
      hasUserInteractedRef.current = false;
    }
  }, [fadeVolume]);

  // Start playing default audio track
  const startAudio = useCallback(async (track: 'rain' | 'piano') => {
    const url = AUDIO_SOURCES[track];
    await startAudioFromUrl(url);
  }, [startAudioFromUrl]);

  // Start playing custom audio track
  const startCustomAudio = useCallback(async (filePath: string) => {
    const url = await getSignedAudioUrl(filePath);
    if (!url) {
      setIsPlaying(false);
      return;
    }
    await startAudioFromUrl(url);
  }, [startAudioFromUrl]);

  // Stop playing audio with fade
  const stopAudio = useCallback((immediate = false) => {
    const audio = audioRef.current;
    if (!audio) {
      setIsPlaying(false);
      return;
    }

    if (immediate || reducedMotion) {
      fadeControllerRef.current.clear();
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
  }, [fadeVolume, reducedMotion]);

  // Change track (for default tracks only)
  const changeTrack = useCallback((newTrack: AudioTrack, customTrackPath?: string) => {
    const newSettings: AudioSettings = { ...settings, track: newTrack, customTrackPath };
    setSettings(newSettings);
    saveAudioSettings(newSettings);

    if (!settings.enabled) return;

    if (newTrack === 'silence') {
      stopAudio();
    } else if (audioRef.current) {
      // Fade out current, then start new
      stopAudio();
      setTimeout(() => {
        if (settings.enabled) {
          if (isCustomTrackId(newTrack) && customTrackPath) {
            startCustomAudio(customTrackPath);
          } else if (newTrack === 'rain' || newTrack === 'piano') {
            startAudio(newTrack);
          }
        }
      }, reducedMotion ? 0 : FADE_OUT_DURATION);
    } else {
      if (isCustomTrackId(newTrack) && customTrackPath) {
        startCustomAudio(customTrackPath);
      } else if (newTrack === 'rain' || newTrack === 'piano') {
        startAudio(newTrack);
      }
    }
  }, [settings, stopAudio, startAudio, startCustomAudio, reducedMotion]);

  // Change volume
  const changeVolume = useCallback((newVolume: number) => {
    const newSettings: AudioSettings = { ...settings, volume: newVolume };
    setSettings(newSettings);
    saveAudioSettings(newSettings);
    targetVolumeRef.current = newVolume / 100;

    if (audioRef.current && isPlaying) {
      audioRef.current.volume = newVolume / 100;
    }
  }, [settings, isPlaying]);

  // Helper to start audio based on track type
  const startTrackAudio = useCallback(async (track: AudioTrack, customPath?: string) => {
    if (track === 'silence') return;
    
    if (isCustomTrackId(track) && customPath) {
      await startCustomAudio(customPath);
    } else if (track === 'rain' || track === 'piano') {
      await startAudio(track);
    }
  }, [startAudio, startCustomAudio]);

  // Toggle enabled
  const toggleEnabled = useCallback(() => {
    const newEnabled = !settings.enabled;
    const newSettings: AudioSettings = { ...settings, enabled: newEnabled };
    setSettings(newSettings);
    saveAudioSettings(newSettings);

    if (newEnabled && settings.track !== 'silence') {
      hasUserInteractedRef.current = true;
      startTrackAudio(settings.track, settings.customTrackPath);
    } else if (!newEnabled) {
      stopAudio();
    }
  }, [settings, startTrackAudio, stopAudio]);

  // Set enabled directly
  const setEnabled = useCallback((enabled: boolean) => {
    const newSettings: AudioSettings = { ...settings, enabled };
    setSettings(newSettings);
    saveAudioSettings(newSettings);

    if (enabled && settings.track !== 'silence') {
      hasUserInteractedRef.current = true;
      startTrackAudio(settings.track, settings.customTrackPath);
    } else if (!enabled) {
      stopAudio();
    }
  }, [settings, startTrackAudio, stopAudio]);

  // Handle user interaction for autoplay unlock
  const handleUserInteraction = useCallback(() => {
    if (hasUserInteractedRef.current) return;
    hasUserInteractedRef.current = true;

    if (settings.enabled && settings.track !== 'silence' && !isPlaying && !audioRef.current) {
      startTrackAudio(settings.track, settings.customTrackPath);
    }
  }, [settings.enabled, settings.track, settings.customTrackPath, isPlaying, startTrackAudio]);

  // Play a custom track directly
  const playCustomTrack = useCallback((track: CustomTrackInfo) => {
    changeTrack(track.id, track.filePath);
  }, [changeTrack]);

  // Check if a track is custom
  const isCustomTrack = useCallback((track: AudioTrack) => {
    return isCustomTrackId(track);
  }, []);

  // Start/stop based on enabled state - runs on mount to restore audio state
  useEffect(() => {
    // Get fresh settings from storage on mount
    const storedSettings = getStoredAudioSettings();
    if (storedSettings.enabled && storedSettings.track !== 'silence') {
      hasUserInteractedRef.current = true;
      startTrackAudio(storedSettings.track, storedSettings.customTrackPath);
    }
    // Note: We intentionally only run on mount to restore persisted state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update target volume ref when settings change
  useEffect(() => {
    targetVolumeRef.current = settings.volume / 100;
  }, [settings.volume]);

  // Cleanup on unmount
  useEffect(() => {
    const fadeController = fadeControllerRef.current;
    return () => {
      fadeController.clear();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
        playCustomTrack,
        isCustomTrack,
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
