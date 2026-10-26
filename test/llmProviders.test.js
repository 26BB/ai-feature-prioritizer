import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeLogMsg, calculateFallbackRice } from '../lib/llmProviders.js';

test('calculateFallbackRice calculates RICE scores and sorts features descending', () => {
  const features = [
    { name: 'Low Impact Feature', category: 'Other', description: 'Short desc' },
    { name: 'High Impact Feature', category: 'Growth', description: 'Short desc' },
  ];
  const results = calculateFallbackRice(features);

  assert.strictEqual(results.length, 2);
  assert.strictEqual(results[0].name, 'High Impact Feature');
  assert.strictEqual(results[0].sprint, 'NOW');
  assert.strictEqual(results[0].rice_score, 1707); // (8 * 8 * 80) / 3 = 1706.66 -> 1707
  assert.strictEqual(results[1].name, 'Low Impact Feature');
  assert.strictEqual(results[1].sprint, 'NOW');
  assert.strictEqual(results[1].rice_score, 800); // (6 * 5 * 80) / 3 = 800
});

test('calculateFallbackRice safely handles non-array, null, or malformed inputs', () => {
  assert.deepStrictEqual(calculateFallbackRice(null), []);
  assert.deepStrictEqual(calculateFallbackRice(undefined), []);
  assert.deepStrictEqual(calculateFallbackRice('invalid'), []);

  const malformedFeatures = [
    null,
    undefined,
    {},
    { name: '  ', category: null, description: null },
  ];
  const results = calculateFallbackRice(malformedFeatures);

  assert.strictEqual(results.length, 4);
  results.forEach((item) => {
    assert.strictEqual(item.name, 'Untitled Feature');
    assert.strictEqual(item.category, 'Other');
    assert.strictEqual(typeof item.rice_score, 'number');
    assert.ok(Number.isFinite(item.rice_score));
  });
});

test('sanitizeLogMsg redacts standard API key pattern prefixes (sk-, gsk_, nvapi-, AIzaSy)', () => {
  const input = 'Error contacting OpenAI: Invalid key sk-proj-1234567890abcdef123456';
  const result = sanitizeLogMsg(input);
  assert.strictEqual(result.includes('sk-proj-1234567890abcdef123456'), false);
  assert.ok(result.includes('[REDACTED_KEY]'));
});

test('sanitizeLogMsg redacts custom BYOK secretKey provided as second argument', () => {
  const customKey = 'my_custom_secret_api_token_998877';
  const input = `Failed request with token my_custom_secret_api_token_998877 at endpoint`;
  const result = sanitizeLogMsg(input, customKey);
  assert.strictEqual(result.includes('my_custom_secret_api_token_998877'), false);
  assert.ok(result.includes('[REDACTED_KEY]'));
});

test('sanitizeLogMsg handles Error objects and redacts keys from stack traces', () => {
  const customKey = 'secret_user_key_5544332211';
  const err = new Error(`Connection timeout for key secret_user_key_5544332211`);
  const result = sanitizeLogMsg(err, customKey);
  assert.strictEqual(result.includes('secret_user_key_5544332211'), false);
  assert.ok(result.includes('[REDACTED_KEY]'));
});

test('sanitizeLogMsg handles null and undefined inputs safely', () => {
  assert.strictEqual(sanitizeLogMsg(null), '');
  assert.strictEqual(sanitizeLogMsg(undefined), '');
});
