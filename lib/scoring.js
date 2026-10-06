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

// ─── Security: CSV Sanitization ────────────────────────────────────────────────

// Bolt optimization: Pre-allocate static regular expressions at module scope to eliminate per-call RegExp instantiation and heap GC overhead during CSV export
const INJECTION_REGEX = /^\s*[=+\-@\t\r]/;
const DOUBLE_QUOTE_REGEX = /"/g;

/**
 * Sanitize a cell value for CSV export to prevent CSV Formula Injection (CWE-1236).
 * Prepends a single quote if string (ignoring leading whitespace) starts with =, +, -, @, \t, or \r.
 *
 * @param {any} val
 * @returns {string} Sanitized and RFC 4180 quote-escaped CSV cell
 */
export function sanitizeCsvCell(val) {
  const str = String(val ?? '');
  const safeStr = INJECTION_REGEX.test(str) ? `'${str}` : str;
  return `"${safeStr.replace(DOUBLE_QUOTE_REGEX, '""')}"`;
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
 * Split a flat feature array into NOW / NEXT / LATER buckets in a single O(n) pass.
 * Case-insensitive so LLM casing variants ('Now', 'now', 'NOW') all work.
 * Anything that isn't NOW or NEXT falls into LATER — no silent data loss.
 *
 * Optimization: Replaced 3 array .filter() traversals with a single O(n) loop pass,
 * reducing string allocations and iterations by 66%.
 *
 * @param {Array} features
 * @returns {{ NOW: Array, NEXT: Array, LATER: Array }}
 */
export function groupBySprint(features) {
  const groups = { NOW: [], NEXT: [], LATER: [] };
  if (!Array.isArray(features)) return groups;

  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    const rawSprint = f?.sprint;
    // Bolt optimization: Fast-path exact uppercase sprint string comparisons before calling .toUpperCase() to avoid redundant string allocations
    if (rawSprint === 'NOW') {
      groups.NOW.push(f);
    } else if (rawSprint === 'NEXT') {
      groups.NEXT.push(f);
    } else if (rawSprint === 'LATER') {
      groups.LATER.push(f);
    } else {
      const sprint = rawSprint?.toUpperCase();
      if (sprint === 'NOW') {
        groups.NOW.push(f);
      } else if (sprint === 'NEXT') {
        groups.NEXT.push(f);
      } else {
        groups.LATER.push(f);
      }
    }
  }

  return groups;
}

// ─── Color helpers (amber theme) ──────────────────────────────────────────────

/** Maps sprint key → amber-theme hex color */
const SPRINT_COLORS = { NOW: '#10b981', NEXT: '#f59e0b', LATER: '#78716c' };

/** Lookup map for sprint badge CSS classes — avoids string allocations and .toLowerCase() calls during render */
const BADGE_CLASSES = {
  NOW: 'badge-now',
  NEXT: 'badge-next',
  LATER: 'badge-later',
  now: 'badge-now',
  next: 'badge-next',
  later: 'badge-later',
};

/**
 * Return the CSS badge class for a sprint key ('NOW' | 'NEXT' | 'LATER').
 * Fast-paths direct lookup before fallback to .toUpperCase().
 *
 * @param {string} sprint
 * @returns {string} CSS class name
 */
export function getSprintBadgeClass(sprint) {
  if (!sprint) return BADGE_CLASSES.LATER;
  return BADGE_CLASSES[sprint] ?? BADGE_CLASSES[sprint.toUpperCase()] ?? BADGE_CLASSES.LATER;
}

/**
 * Return the display color for a sprint badge.
 *
 * @param {string} sprint  'NOW' | 'NEXT' | 'LATER' (case-insensitive)
 * @returns {string} CSS hex color
 */
export function getSprintColor(sprint) {
  // Bolt optimization: Fast-path direct map lookup before fallback to .toUpperCase() to prevent string allocation
  return SPRINT_COLORS[sprint] ?? SPRINT_COLORS[sprint?.toUpperCase()] ?? SPRINT_COLORS.LATER;
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
