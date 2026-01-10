/**
 * Utility functions for prayer topic handling
 */

const CONTINUING_PREFIX = 'continuing to lift up:';

/**
 * Strip all "Continuing to lift up:" prefixes from text
 * Handles nested prefixes (e.g., "Continuing to lift up: Continuing to lift up: ...")
 */
export function stripContinuingPrefix(text: string): string {
  let cleaned = text.trim();
  while (cleaned.toLowerCase().startsWith(CONTINUING_PREFIX)) {
    cleaned = cleaned.substring(CONTINUING_PREFIX.length).trim();
  }
  return cleaned;
}

/**
 * Check if two topics are similar by comparing first 50 chars (case-insensitive)
 * after stripping prefixes
 */
export function isSimilarTopic(newContent: string, existingSummary: string): boolean {
  const cleanedNew = stripContinuingPrefix(newContent).substring(0, 50).toLowerCase().trim();
  const cleanedExisting = stripContinuingPrefix(existingSummary).substring(0, 50).toLowerCase().trim();
  
  // Both must have content to compare
  if (!cleanedNew || !cleanedExisting) return false;
  
  return cleanedNew === cleanedExisting;
}
