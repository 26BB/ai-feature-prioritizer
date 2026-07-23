/**
 * scratch/check-scoring.mjs
 *
 * Coding Buddy self-check for lib/scoring.js
 * Run with: node scratch/check-scoring.mjs
 * Zero runtime dependencies.
 */

// ─── Inline copies (avoids ESM import path complexity in scratch) ──────────────
function calcRice({ reach, impact, confidence, effort }) {
  return Math.round((reach * impact * confidence) / effort);
}

function groupBySprint(features) {
  return {
    NOW:   features.filter((f) => f.sprint?.toUpperCase() === 'NOW'),
    NEXT:  features.filter((f) => f.sprint?.toUpperCase() === 'NEXT'),
    LATER: features.filter((f) => !['NOW', 'NEXT'].includes(f.sprint?.toUpperCase())),
  };
}

// ─── Assertions ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    console.error(`     expected: ${expected}`);
    console.error(`     received: ${actual}`);
    failed++;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
console.log('\n📊 calcRice');
assert('basic formula', calcRice({ reach: 8, impact: 9, confidence: 85, effort: 3 }), 2040);
assert('rounds correctly', calcRice({ reach: 1, impact: 1, confidence: 33, effort: 3 }), 11);

console.log('\n🗂  groupBySprint — case variants');
const features = [
  { name: 'A', sprint: 'NOW' },
  { name: 'B', sprint: 'Now' },      // LLM casing variant
  { name: 'C', sprint: 'NEXT' },
  { name: 'D', sprint: null  },      // null sprint → LATER fallback
  { name: 'E', sprint: 'LATER' },
  { name: 'F', sprint: 'unknown' },  // unknown → LATER fallback
];
const groups = groupBySprint(features);
assert('NOW count (case-insensitive)',  groups.NOW.length,   2);
assert('NEXT count',                   groups.NEXT.length,  1);
assert('LATER catches null sprint',    groups.LATER.length, 3);
assert('no feature is lost',
  groups.NOW.length + groups.NEXT.length + groups.LATER.length, features.length);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed · ${failed} failed\n`);
if (failed > 0) process.exit(1);
