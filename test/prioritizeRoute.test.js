import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../app/api/prioritize/route.js';

test('POST /api/prioritize handles malformed JSON request gracefully', async () => {
  const req = new Request('http://localhost/api/prioritize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'invalid-json-{',
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Invalid JSON request payload');
});

test('POST /api/prioritize handles null or non-object JSON payload gracefully', async () => {
  const req = new Request('http://localhost/api/prioritize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'null',
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Invalid JSON request payload');
});

test('POST /api/prioritize handles invalid feature payload without scope error', async () => {
  const req = new Request('http://localhost/api/prioritize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features: [{ description: 'missing name field' }] }),
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Feature #1 requires a valid name');
});

test('POST /api/prioritize processes valid features array successfully', async () => {
  const req = new Request('http://localhost/api/prioritize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-provider': 'auto',
      'x-api-key': 'sk-test-key-12345',
    },
    body: JSON.stringify({
      features: [{ name: 'Test Feature 1', description: 'Testing prioritize route', category: 'Growth' }],
    }),
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.features));
  assert.strictEqual(data.features.length, 1);
  assert.strictEqual(data.features[0].name, 'Test Feature 1');
  assert.ok(data.model);
});
