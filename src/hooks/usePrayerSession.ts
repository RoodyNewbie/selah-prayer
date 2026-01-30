import { useReducer, useCallback } from 'react';
import { PrayerFormat } from '@/hooks/usePrayerFormats';

// ============================================================================
// Types
// ============================================================================

export interface PrayerSessionState {
  // Format & navigation
  selectedFormat: PrayerFormat | null;
  currentPhaseIndex: number;
  phaseContent: Record<string, string>;
  skippedPhases: Set<string>;

  // Session completion
  isComplete: boolean;
  savedSessionId: string | null;
  saveError: string | null;

  // AI generation
  isGenerating: boolean;
  generatedPrayer: string | null;
  copied: boolean;
  lastGeneratedAt: number;
  remainingGenerations: number | null;
  dailyLimit: number | null;

  // Meditation/completion screen
  personalPrayer: string;
  selectedDuration: number;
  isSavingPersonal: boolean;
  showPhaseNotes: boolean;
}

type PrayerSessionAction =
  | { type: 'SET_FORMAT'; payload: PrayerFormat | null }
  | { type: 'NEXT_PHASE' }
  | { type: 'SKIP_PHASE'; payload: string }
  | { type: 'SET_PHASE_CONTENT'; payload: { phaseId: string; content: string } }
  | { type: 'SET_COMPLETE'; payload: { sessionId: string } }
  | { type: 'SET_SAVE_ERROR'; payload: string | null }
  | { type: 'CLEAR_SAVE_ERROR' }
  | { type: 'START_GENERATING' }
  | { type: 'GENERATION_SUCCESS'; payload: { prayer: string; remaining?: number; limit?: number } }
  | { type: 'GENERATION_ERROR'; payload?: { remaining?: number; limit?: number } }
  | { type: 'SET_COPIED'; payload: boolean }
  | { type: 'SET_PERSONAL_PRAYER'; payload: string }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_SAVING_PERSONAL'; payload: boolean }
  | { type: 'TOGGLE_PHASE_NOTES' }
  | { type: 'UPDATE_GENERATION_LIMITS'; payload: { remaining?: number; limit?: number } }
  | { type: 'RESET' };

// ============================================================================
// Initial State
// ============================================================================

const initialState: PrayerSessionState = {
  selectedFormat: null,
  currentPhaseIndex: 0,
  phaseContent: {},
  skippedPhases: new Set(),
  isComplete: false,
  savedSessionId: null,
  saveError: null,
  isGenerating: false,
  generatedPrayer: null,
  copied: false,
  lastGeneratedAt: 0,
  remainingGenerations: null,
  dailyLimit: null,
  personalPrayer: '',
  selectedDuration: 10,
  isSavingPersonal: false,
  showPhaseNotes: false,
};

// ============================================================================
// Reducer
// ============================================================================

function prayerSessionReducer(
  state: PrayerSessionState,
  action: PrayerSessionAction
): PrayerSessionState {
  switch (action.type) {
    case 'SET_FORMAT':
      return {
        ...state,
        selectedFormat: action.payload,
        currentPhaseIndex: 0,
        phaseContent: {},
        skippedPhases: new Set(),
      };

    case 'NEXT_PHASE':
      return {
        ...state,
        currentPhaseIndex: state.currentPhaseIndex + 1,
      };

    case 'SKIP_PHASE':
      return {
        ...state,
        currentPhaseIndex: state.currentPhaseIndex + 1,
        skippedPhases: new Set(state.skippedPhases).add(action.payload),
      };

    case 'SET_PHASE_CONTENT':
      return {
        ...state,
        phaseContent: {
          ...state.phaseContent,
          [action.payload.phaseId]: action.payload.content,
        },
      };

    case 'SET_COMPLETE':
      return {
        ...state,
        isComplete: true,
        savedSessionId: action.payload.sessionId,
        saveError: null,
      };

    case 'SET_SAVE_ERROR':
      return {
        ...state,
        saveError: action.payload,
      };

    case 'CLEAR_SAVE_ERROR':
      return {
        ...state,
        saveError: null,
      };

    case 'START_GENERATING':
      return {
        ...state,
        isGenerating: true,
        lastGeneratedAt: Date.now(),
      };

    case 'GENERATION_SUCCESS':
      return {
        ...state,
        isGenerating: false,
        generatedPrayer: action.payload.prayer,
        remainingGenerations: action.payload.remaining ?? state.remainingGenerations,
        dailyLimit: action.payload.limit ?? state.dailyLimit,
      };

    case 'GENERATION_ERROR':
      return {
        ...state,
        isGenerating: false,
        remainingGenerations: action.payload?.remaining ?? state.remainingGenerations,
        dailyLimit: action.payload?.limit ?? state.dailyLimit,
      };

    case 'SET_COPIED':
      return {
        ...state,
        copied: action.payload,
      };

    case 'SET_PERSONAL_PRAYER':
      return {
        ...state,
        personalPrayer: action.payload,
      };

    case 'SET_DURATION':
      return {
        ...state,
        selectedDuration: action.payload,
      };

    case 'SET_SAVING_PERSONAL':
      return {
        ...state,
        isSavingPersonal: action.payload,
      };

    case 'TOGGLE_PHASE_NOTES':
      return {
        ...state,
        showPhaseNotes: !state.showPhaseNotes,
      };

    case 'UPDATE_GENERATION_LIMITS':
      return {
        ...state,
        remainingGenerations: action.payload.remaining ?? state.remainingGenerations,
        dailyLimit: action.payload.limit ?? state.dailyLimit,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Hook
// ============================================================================

export function usePrayerSession(defaultDuration?: number) {
  const [state, dispatch] = useReducer(prayerSessionReducer, {
    ...initialState,
    selectedDuration: defaultDuration ?? 10,
  });

  // Action creators for cleaner API
  const actions = {
    setFormat: useCallback((format: PrayerFormat | null) => {
      dispatch({ type: 'SET_FORMAT', payload: format });
    }, []),

    nextPhase: useCallback(() => {
      dispatch({ type: 'NEXT_PHASE' });
    }, []),

    skipPhase: useCallback((phaseId: string) => {
      dispatch({ type: 'SKIP_PHASE', payload: phaseId });
    }, []),

    setPhaseContent: useCallback((phaseId: string, content: string) => {
      dispatch({ type: 'SET_PHASE_CONTENT', payload: { phaseId, content } });
    }, []),

    setComplete: useCallback((sessionId: string) => {
      dispatch({ type: 'SET_COMPLETE', payload: { sessionId } });
    }, []),

    setSaveError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_SAVE_ERROR', payload: error });
    }, []),

    clearSaveError: useCallback(() => {
      dispatch({ type: 'CLEAR_SAVE_ERROR' });
    }, []),

    startGenerating: useCallback(() => {
      dispatch({ type: 'START_GENERATING' });
    }, []),

    generationSuccess: useCallback((prayer: string, remaining?: number, limit?: number) => {
      dispatch({ type: 'GENERATION_SUCCESS', payload: { prayer, remaining, limit } });
    }, []),

    generationError: useCallback((remaining?: number, limit?: number) => {
      dispatch({ type: 'GENERATION_ERROR', payload: { remaining, limit } });
    }, []),

    setCopied: useCallback((copied: boolean) => {
      dispatch({ type: 'SET_COPIED', payload: copied });
    }, []),

    setPersonalPrayer: useCallback((prayer: string) => {
      dispatch({ type: 'SET_PERSONAL_PRAYER', payload: prayer });
    }, []),

    setDuration: useCallback((duration: number) => {
      dispatch({ type: 'SET_DURATION', payload: duration });
    }, []),

    setSavingPersonal: useCallback((saving: boolean) => {
      dispatch({ type: 'SET_SAVING_PERSONAL', payload: saving });
    }, []),

    togglePhaseNotes: useCallback(() => {
      dispatch({ type: 'TOGGLE_PHASE_NOTES' });
    }, []),

    updateGenerationLimits: useCallback((remaining?: number, limit?: number) => {
      dispatch({ type: 'UPDATE_GENERATION_LIMITS', payload: { remaining, limit } });
    }, []),

    reset: useCallback(() => {
      dispatch({ type: 'RESET' });
    }, []),
  };

  return { state, actions };
}

// Rate limiting constant
export const GENERATION_COOLDOWN_MS = 30000; // 30 seconds between generations
