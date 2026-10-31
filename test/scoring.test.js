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

test('sortByRice sorts features descending by rice_score without mutating input array', () => {
  const original = [
    { name: 'Feature B', rice_score: 150 },
    { name: 'Feature A', rice_score: 500 },
    { name: 'Feature C', rice_score: 50 },
  ];

  const sorted = sortByRice(original);

  assert.deepEqual(sorted.map((f) => f.name), ['Feature A', 'Feature B', 'Feature C']);
  // Assert input array is not mutated
  assert.equal(original[0].name, 'Feature B');
  assert.notEqual(sorted, original);
});

test('sortByRice handles non-array inputs, null/undefined elements, and invalid rice_score values safely', () => {
  assert.deepEqual(sortByRice(null), []);
  assert.deepEqual(sortByRice(undefined), []);
  assert.deepEqual(sortByRice('invalid'), []);
  assert.deepEqual(sortByRice(123), []);

  const messyFeatures = [
    { name: 'Valid Low', rice_score: 10 },
    null,
    { name: 'Valid High', rice_score: '200' },
    { name: 'Invalid Score', rice_score: 'NaN' },
    undefined,
    { name: 'Missing Score' },
  ];

  const sortedMessy = sortByRice(messyFeatures);
  assert.equal(sortedMessy.length, 6);
  assert.equal(sortedMessy[0].name, 'Valid High');
  assert.equal(sortedMessy[1].name, 'Valid Low');
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

  // Edge cases & malformed / non-string sprint values
  assert.deepEqual(groupBySprint(null), { NOW: [], NEXT: [], LATER: [] });
  assert.deepEqual(groupBySprint([]), { NOW: [], NEXT: [], LATER: [] });
  assert.deepEqual(groupBySprint([{ sprint: 123 }, { sprint: {} }, { sprint: true }]), {
    NOW: [],
    NEXT: [],
    LATER: [{ sprint: 123 }, { sprint: {} }, { sprint: true }],
  });
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
  assert.equal(getSprintBadgeClass(undefined), 'badge-later');
  assert.equal(getSprintBadgeClass(123), 'badge-later');
  assert.equal(getSprintBadgeClass({}), 'badge-later');
});

test('getSprintColor returns expected CSS hex color and handles invalid inputs', async () => {
  const { getSprintColor } = await import('../lib/scoring.js');
  assert.equal(getSprintColor('NOW'), '#10b981');
  assert.equal(getSprintColor('now'), '#10b981');
  assert.equal(getSprintColor('NEXT'), '#f59e0b');
  assert.equal(getSprintColor('next'), '#f59e0b');
  assert.equal(getSprintColor('LATER'), '#78716c');
  assert.equal(getSprintColor('later'), '#78716c');
  assert.equal(getSprintColor(null), '#78716c');
  assert.equal(getSprintColor(undefined), '#78716c');
  assert.equal(getSprintColor(123), '#78716c');
  assert.equal(getSprintColor({}), '#78716c');
});

test('getScoreColor returns expected hex color for score threshold', () => {
  // Excellent score (> 0.6 max)
  assert.equal(getScoreColor(700, 1000), '#f59e0b');
  // Average score (> 0.3 max)
  assert.equal(getScoreColor(400, 1000), '#f97316');
  // Low score
  assert.equal(getScoreColor(200, 1000), '#f43f5e');

  // Edge cases & invalid inputs
  assert.equal(getScoreColor(NaN, 1000), '#f43f5e');
  assert.equal(getScoreColor('invalid', 1000), '#f43f5e');
  assert.equal(getScoreColor(500, 0), '#f43f5e');
  assert.equal(getScoreColor(500, -100), '#f43f5e');
  assert.equal(getScoreColor(null), '#f43f5e');
});
