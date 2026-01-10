/**
 * Animation timing constants for guided prayer transitions.
 * Designed for a calm, meditative experience.
 */
export const TRANSITION_TIMINGS = {
  /** Fade out duration for current phase */
  fadeOut: 400,
  /** Pause between phases (breathing room) */
  pauseBetween: 200,
  /** Fade in duration for new phase */
  fadeIn: 500,
  /** Delay between staggered elements (header → prompt → scripture) */
  staggerDelay: 150,
  /** Progress bar fill animation */
  progressFill: 300,
  /** Pulse duration for active phase indicator */
  pulseDuration: 600,
} as const;

/** Total transition time for phase changes */
export const TOTAL_TRANSITION_TIME = 
  TRANSITION_TIMINGS.fadeOut + 
  TRANSITION_TIMINGS.pauseBetween + 
  TRANSITION_TIMINGS.fadeIn;
