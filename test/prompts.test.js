import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRicePrompt } from '../lib/prompts.js';

test('buildRicePrompt builds formatted prompt for valid feature items', () => {
  const features = [
    { name: 'Feature A', description: 'Description A', category: 'Growth' },
    { name: 'Feature B', description: 'Description B', category: 'Security' },
  ];

  const result = buildRicePrompt(features);
  assert.equal(typeof result, 'string');
  assert.ok(result.includes('1. Name: "Feature A"'));
  assert.ok(result.includes('Description: "Description A"'));
  assert.ok(result.includes('Category: Growth'));
  assert.ok(result.includes('2. Name: "Feature B"'));
  assert.ok(result.includes('RICE SCORING RULES:'));
});

test('buildRicePrompt handles null, undefined, or non-array inputs safely', () => {
  assert.doesNotThrow(() => {
    const resNull = buildRicePrompt(null);
    assert.equal(typeof resNull, 'string');

    const resUndef = buildRicePrompt(undefined);
    assert.equal(typeof resUndef, 'string');

    const resNum = buildRicePrompt(12345);
    assert.equal(typeof resNum, 'string');
  });
});

test('buildRicePrompt handles arrays with null, undefined, or malformed feature items', () => {
  const malformedFeatures = [
    null,
    undefined,
    { name: null, description: undefined, category: 123 },
    'not_an_object',
  ];

  assert.doesNotThrow(() => {
    const result = buildRicePrompt(malformedFeatures);
    assert.equal(typeof result, 'string');
    assert.ok(result.includes('FEATURES TO ANALYZE:'));
    assert.ok(result.includes('1. Name: ""'));
  });
});

test('buildRicePrompt sanitizes double quotes, backslashes, and newlines', () => {
  const features = [
    {
      name: 'Quote "Test" & Slash \\ Test',
      description: 'Line 1\nLine 2',
      category: 'UX/Design',
    },
  ];

  const result = buildRicePrompt(features);
  assert.ok(result.includes('Quote \\"Test\\" & Slash \\\\ Test'));
  assert.ok(result.includes('Line 1 Line 2'));
});
