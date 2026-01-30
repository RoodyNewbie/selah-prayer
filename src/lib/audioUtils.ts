/**
 * Shared audio utilities for ambient audio and meditation features.
 * This module centralizes audio-related logic to eliminate duplication.
 */

// Extend Window interface to include webkit AudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// ============================================================================
// Types
// ============================================================================

export type BuiltInAudioTrack = 'silence' | 'rain' | 'piano';
export type AudioTrack = BuiltInAudioTrack | string; // string for custom track IDs

export interface AudioSettings {
  track: AudioTrack;
  volume: number; // 0-100
  enabled?: boolean;
  customTrackPath?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const AUDIO_STORAGE_KEY = 'selah_audio_settings';
export const FADE_IN_DURATION = 2000;
export const FADE_OUT_DURATION = 1500;
export const FADE_INTERVAL = 50;

export const AUDIO_SOURCES: Record<Exclude<BuiltInAudioTrack, 'silence'>, string> = {
  rain: '/audio/rain_thunder.mp3',
  piano: '/audio/ambient_piano.mp3',
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  track: 'silence',
  volume: 50,
  enabled: false,
};

// ============================================================================
// Storage Functions
// ============================================================================

export function getStoredAudioSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        track: parsed.track || 'silence',
        volume: typeof parsed.volume === 'number' ? parsed.volume : 50,
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
        customTrackPath: parsed.customTrackPath,
      };
    }
  } catch {
    // Silently fail - will use defaults
  }
  return { ...DEFAULT_AUDIO_SETTINGS };
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail - localStorage might be full or unavailable
  }
}

// ============================================================================
// Track Utilities
// ============================================================================

/**
 * Check if a track ID represents a custom (user-uploaded) track
 */
export function isCustomTrackId(track: AudioTrack): boolean {
  if (track === 'silence' || track === 'rain' || track === 'piano') return false;
  // UUID pattern check or custom prefix
  return /^[a-f0-9-]{36}$/i.test(track) || track.startsWith('custom-');
}

/**
 * Check if we should prefer reduced motion (accessibility)
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================================================
// Audio Fade Utilities
// ============================================================================

export interface FadeController {
  intervalId: number | null;
  clear: () => void;
}

/**
 * Creates a fade controller to manage volume fade intervals
 */
export function createFadeController(): FadeController {
  const controller: FadeController = {
    intervalId: null,
    clear() {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
  };
  return controller;
}

/**
 * Fades audio volume to a target value over a specified duration
 */
export function fadeVolume(
  audio: HTMLAudioElement,
  targetVolume: number,
  duration: number,
  fadeController: FadeController,
  onComplete?: () => void
): void {
  fadeController.clear();

  if (prefersReducedMotion() || duration === 0) {
    audio.volume = targetVolume;
    onComplete?.();
    return;
  }

  const startVolume = audio.volume;
  const volumeDiff = targetVolume - startVolume;
  const steps = duration / FADE_INTERVAL;
  const volumeStep = volumeDiff / steps;
  let currentStep = 0;

  fadeController.intervalId = window.setInterval(() => {
    currentStep++;
    const newVolume = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep));
    audio.volume = newVolume;

    if (currentStep >= steps) {
      fadeController.clear();
      audio.volume = targetVolume;
      onComplete?.();
    }
  }, FADE_INTERVAL);
}

// ============================================================================
// Web Audio Chime (Meditation Bell)
// ============================================================================

const CHIME_FREQUENCY = 528; // Hz - "love frequency" / healing tone

/**
 * Plays a gentle bell-like chime using the Web Audio API.
 * This is a fallback when MP3 audio cannot be played.
 */
export function playWebAudioChime(): void {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = CHIME_FREQUENCY;
    oscillator.type = 'sine';

    // Gentle fade in and out for a soft bell sound
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2.5); // Slow decay

    oscillator.start(now);
    oscillator.stop(now + 2.5);

    // Cleanup
    setTimeout(() => {
      audioContext.close();
    }, 3000);
  } catch {
    // Silently fail - audio not critical
  }
}

const CHIME_MP3_PATH = '/audio/meditation-chime.mp3';
const CHIME_VOLUME = 0.6;

/**
 * Plays the meditation chime, attempting MP3 first, falling back to Web Audio
 */
export function playMeditationChime(): void {
  const audio = new Audio(CHIME_MP3_PATH);
  audio.volume = CHIME_VOLUME;

  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // MP3 failed, fall back to Web Audio API
      playWebAudioChime();
    });
  }
}
