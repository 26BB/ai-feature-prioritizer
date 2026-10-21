import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeLogMsg } from '../lib/llmProviders.js';

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
