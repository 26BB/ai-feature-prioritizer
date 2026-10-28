import test from 'node:test';
import assert from 'node:assert/strict';

// Pure helper function implementing saveSessionToHistory validation & payload formatting
function formatSessionHistoryPayload(user, sessionData) {
  if (!user) {
    throw new Error('You must be logged in to save prioritization history.');
  }

  if (!sessionData || typeof sessionData !== 'object') {
    throw new Error('Invalid session data provided.');
  }

  if (typeof user?.uid !== 'string' || !user.uid || !/^[a-zA-Z0-9_-]+$/.test(user.uid)) {
    throw new Error('Invalid user account ID.');
  }

  const features = Array.isArray(sessionData.features) ? sessionData.features : [];

  const title =
    typeof sessionData.title === 'string' && sessionData.title.trim()
      ? sessionData.title.trim()
      : features[0]?.name
      ? `${features[0].name}${features.length > 1 ? ` +${features.length - 1} more` : ''}`
      : 'Feature Prioritization';

  const topFeature = typeof features[0]?.name === 'string' ? features[0].name : 'N/A';
  const topRice = typeof features[0]?.rice_score === 'number' ? features[0].rice_score : 0;
  const model = sessionData.model || 'meta/llama-3.3-70b-instruct';

  return {
    title,
    features,
    featureCount: features.length,
    topFeature,
    topRice,
    model,
  };
}

test('formatSessionHistoryPayload throws error when user is unauthenticated', () => {
  assert.throws(
    () => formatSessionHistoryPayload(null, { features: [] }),
    { message: 'You must be logged in to save prioritization history.' }
  );
});

test('formatSessionHistoryPayload throws error when sessionData is null, undefined, or non-object', () => {
  const mockUser = { uid: 'user_123' };
  assert.throws(
    () => formatSessionHistoryPayload(mockUser, null),
    { message: 'Invalid session data provided.' }
  );
  assert.throws(
    () => formatSessionHistoryPayload(mockUser, undefined),
    { message: 'Invalid session data provided.' }
  );
  assert.throws(
    () => formatSessionHistoryPayload(mockUser, 'invalid_string'),
    { message: 'Invalid session data provided.' }
  );
  assert.throws(
    () => formatSessionHistoryPayload(mockUser, 12345),
    { message: 'Invalid session data provided.' }
  );
});

test('formatSessionHistoryPayload throws error on invalid or malicious user UID', () => {
  const badUser = { uid: '../admin/leak' };
  assert.throws(
    () => formatSessionHistoryPayload(badUser, { features: [] }),
    { message: 'Invalid user account ID.' }
  );
});

test('formatSessionHistoryPayload handles missing or non-array features field safely', () => {
  const mockUser = { uid: 'user_123' };

  // Non-array features field
  const payload1 = formatSessionHistoryPayload(mockUser, { features: 'not_an_array' });
  assert.strictEqual(payload1.featureCount, 0);
  assert.deepStrictEqual(payload1.features, []);
  assert.strictEqual(payload1.title, 'Feature Prioritization');
  assert.strictEqual(payload1.topFeature, 'N/A');
  assert.strictEqual(payload1.topRice, 0);

  // Missing features field
  const payload2 = formatSessionHistoryPayload(mockUser, {});
  assert.strictEqual(payload2.featureCount, 0);
  assert.deepStrictEqual(payload2.features, []);
});

test('formatSessionHistoryPayload formats title and top stats correctly for valid session', () => {
  const mockUser = { uid: 'user_456' };

  const session = {
    features: [
      { name: 'Feature A', rice_score: 850 },
      { name: 'Feature B', rice_score: 420 },
    ],
    model: 'gpt-4o-mini',
  };

  const payload = formatSessionHistoryPayload(mockUser, session);
  assert.strictEqual(payload.title, 'Feature A +1 more');
  assert.strictEqual(payload.topFeature, 'Feature A');
  assert.strictEqual(payload.topRice, 850);
  assert.strictEqual(payload.featureCount, 2);
  assert.strictEqual(payload.model, 'gpt-4o-mini');
});
