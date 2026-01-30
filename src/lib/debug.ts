/**
 * Debug utilities for development logging.
 * All debug logs are disabled in production builds.
 */

const isDev = import.meta.env.DEV;

/**
 * Debug logger that only logs in development mode.
 * Use this for verbose debugging that shouldn't appear in production.
 */
export const debug = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args);
    }
  },
};

/**
 * Creates a prefixed debug logger for a specific module.
 */
export function createDebugLogger(prefix: string) {
  return {
    log: (...args: unknown[]) => {
      if (isDev) {
        console.log(`[${prefix}]`, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (isDev) {
        console.warn(`[${prefix}]`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      if (isDev) {
        console.error(`[${prefix}]`, ...args);
      }
    },
  };
}
