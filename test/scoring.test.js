import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcRice,
  sanitizeCsvCell,
  sortByRice,
  groupBySprint,
  getSprintBadgeClass,
  getScoreColor,
} from '../lib/scoring.js';

test('calcRice calculates rounded RICE score correctly', () => {
  // (8 * 9 * 85) / 3 = 2040
  assert.equal(calcRice({ reach: 8, impact: 9, confidence: 85, effort: 3 }), 2040);
  // (1 * 1 * 33) / 3 = 11
  assert.equal(calcRice({ reach: 1, impact: 1, confidence: 33, effort: 3 }), 11);
});

test('calcRice handles zero/negative effort, missing inputs, and non-numeric values safely', () => {
  assert.equal(calcRice({ reach: 10, impact: 10, confidence: 100, effort: 0 }), 0);
  assert.equal(calcRice({ reach: 10, impact: 10, confidence: 100, effort: -2 }), 0);
  assert.equal(calcRice({ reach: 10, impact: 'invalid', confidence: 100, effort: 2 }), 0);
  assert.equal(calcRice({ reach: null, impact: 5, confidence: 80, effort: 3 }), 0);
  assert.equal(calcRice(), 0);
});

test('sortByRice sorts features by RICE score descending and handles edge cases safely', () => {
  const features = [
    { name: 'Feat A', rice_score: 100 },
    { name: 'Feat B', rice_score: 500 },
    { name: 'Feat C', rice_score: 250 },
  ];

  const sorted = sortByRice(features);

  assert.deepEqual(
    sorted.map((f) => f.name),
    ['Feat B', 'Feat C', 'Feat A']
  );

  // Immutability check
  assert.notEqual(sorted, features);
  assert.equal(features[0].name, 'Feat A');

  // Edge cases: non-array, null/undefined elements, missing or non-numeric rice_score
  assert.deepEqual(sortByRice(null), []);
  assert.deepEqual(sortByRice('not an array'), []);
  const mixedInput = [null, undefined, { name: 'Valid', rice_score: 10 }, { name: 'Invalid', rice_score: 'bad' }];
  const sortedMixed = sortByRice(mixedInput);
  assert.equal(sortedMixed[0].name, 'Valid');
  assert.equal(sortedMixed.length, 4);
});

test('sanitizeCsvCell prevents CSV Formula Injection (CWE-1236) and escapes double quotes', () => {
  // Normal text
  assert.equal(sanitizeCsvCell('Feature A'), '"Feature A"');
  // Formula injection characters: =, +, -, @, \t, \r
  assert.equal(sanitizeCsvCell('=1+2'), `"'=1+2"`);
  assert.equal(sanitizeCsvCell('+SUM(A1:A10)'), `"'+SUM(A1:A10)"`);
  assert.equal(sanitizeCsvCell('-cmd'), `"'-cmd"`);
  assert.equal(sanitizeCsvCell('@SUM'), `"'@SUM"`);
  // Quote escaping
  assert.equal(sanitizeCsvCell('Feature "Beta"'), '"Feature ""Beta"""');
  // Null/undefined values
  assert.equal(sanitizeCsvCell(null), '""');
  assert.equal(sanitizeCsvCell(undefined), '""');
});

test('groupBySprint groups features into NOW, NEXT, LATER in a single pass', () => {
  const features = [
    { name: 'Feat 1', sprint: 'NOW' },
    { name: 'Feat 2', sprint: 'now' },
    { name: 'Feat 3', sprint: 'NEXT' },
    { name: 'Feat 4', sprint: 'Next' },
    { name: 'Feat 5', sprint: 'LATER' },
    { name: 'Feat 6', sprint: 'unknown' },
    { name: 'Feat 7', sprint: null },
  ];

  const grouped = groupBySprint(features);

  assert.equal(grouped.NOW.length, 2);
  assert.equal(grouped.NEXT.length, 2);
  assert.equal(grouped.LATER.length, 3);
  assert.deepEqual(grouped.NOW.map((f) => f.name), ['Feat 1', 'Feat 2']);
  assert.deepEqual(grouped.NEXT.map((f) => f.name), ['Feat 3', 'Feat 4']);
  assert.deepEqual(grouped.LATER.map((f) => f.name), ['Feat 5', 'Feat 6', 'Feat 7']);

  // Edge cases
  assert.deepEqual(groupBySprint(null), { NOW: [], NEXT: [], LATER: [] });
  assert.deepEqual(groupBySprint([]), { NOW: [], NEXT: [], LATER: [] });
});

test('getSprintBadgeClass returns correct CSS badge class name', () => {
  assert.equal(getSprintBadgeClass('NOW'), 'badge-now');
  assert.equal(getSprintBadgeClass('now'), 'badge-now');
  assert.equal(getSprintBadgeClass('NEXT'), 'badge-next');
  assert.equal(getSprintBadgeClass('next'), 'badge-next');
  assert.equal(getSprintBadgeClass('LATER'), 'badge-later');
  assert.equal(getSprintBadgeClass('later'), 'badge-later');
  assert.equal(getSprintBadgeClass('INVALID'), 'badge-later');
  assert.equal(getSprintBadgeClass(null), 'badge-later');
});

test('getScoreColor returns expected hex color for score threshold', () => {
  // Excellent score (> 0.6 max)
  assert.equal(getScoreColor(700, 1000), '#f59e0b');
  // Average score (> 0.3 max)
  assert.equal(getScoreColor(400, 1000), '#f97316');
  // Low score
  assert.equal(getScoreColor(200, 1000), '#f43f5e');
});
