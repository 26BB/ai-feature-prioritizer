/**
 * lib/scoring.js
 *
 * Pure utility functions for RICE scoring logic.
 * No side-effects. No imports. Every function is independently testable.
 */

// ─── RICE formula ─────────────────────────────────────────────────────────────

/**
 * Calculate a RICE score from its four components.
 * Formula: (Reach × Impact × Confidence) / Effort
 *
 * @param {{ reach: number, impact: number, confidence: number, effort: number }} components
 * @returns {number} Rounded RICE score
 */
export function calcRice({ reach, impact, confidence, effort }) {
  return Math.round((reach * impact * confidence) / effort);
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

/**
 * Sort features by RICE score, highest first.
 * Returns a new array — does not mutate the input.
 *
 * @param {Array} features
 * @returns {Array}
 */
export function sortByRice(features) {
  return [...features].sort((a, b) => b.rice_score - a.rice_score);
}

// ─── Sprint grouping ──────────────────────────────────────────────────────────

/**
 * Split a flat feature array into NOW / NEXT / LATER buckets.
 *
 * Case-insensitive so LLM casing variants ('Now', 'now', 'NOW') all work.
 * Anything that isn't NOW or NEXT falls into LATER — no silent data loss.
 *
 * ponytail: toUpperCase() is the ceiling — upgrade to a Set lookup if sprint
 *           values ever expand beyond 3 options.
 *
 * @param {Array} features
 * @returns {{ NOW: Array, NEXT: Array, LATER: Array }}
 */
export function groupBySprint(features) {
  return {
    NOW:   features.filter((f) => f.sprint?.toUpperCase() === 'NOW'),
    NEXT:  features.filter((f) => f.sprint?.toUpperCase() === 'NEXT'),
    LATER: features.filter((f) => !['NOW', 'NEXT'].includes(f.sprint?.toUpperCase())),
  };
}

// ─── Color helpers (amber theme) ──────────────────────────────────────────────

/** Maps sprint key → amber-theme hex color */
const SPRINT_COLORS = { NOW: '#10b981', NEXT: '#f59e0b', LATER: '#78716c' };

/**
 * Return the display color for a sprint badge.
 *
 * @param {string} sprint  'NOW' | 'NEXT' | 'LATER' (case-insensitive)
 * @returns {string} CSS hex color
 */
export function getSprintColor(sprint) {
  return SPRINT_COLORS[sprint?.toUpperCase()] ?? SPRINT_COLORS.LATER;
}

/**
 * Return a color that reflects how good a RICE score is.
 * High → amber gold, mid → orange, low → rose.
 *
 * @param {number} score
 * @param {number} [max=1000] Upper bound for normalization
 * @returns {string} CSS hex color
 */
export function getScoreColor(score, max = 1000) {
  const ratio = score / max;
  if (ratio > 0.6) return '#f59e0b'; // amber  — excellent
  if (ratio > 0.3) return '#f97316'; // orange — average
  return '#f43f5e';                  // rose   — low priority
}
