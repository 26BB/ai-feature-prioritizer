import { prioritizeFeatures } from '@/lib/llmProviders';

// Security: In-memory sliding window rate limiter (CWE-770) to protect LLM API tokens and prevent DoS
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_RATE_LIMITER_MAP_SIZE = 1000;
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    if (rateLimitMap.size >= MAX_RATE_LIMITER_MAP_SIZE) {
      const oldestKey = rateLimitMap.keys().next().value;
      if (oldestKey) rateLimitMap.delete(oldestKey);
    }
    record = { count: 1, startTime: now };
    rateLimitMap.set(ip, record);
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((record.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfterSeconds) };
  }

  record.count += 1;
  return { allowed: true };
}

// Max input character lengths to prevent DoS and prompt injection risks
const MAX_NAME_LENGTH = 200;
const MAX_DESC_LENGTH = 1000;
const MAX_CAT_LENGTH = 100;

// Bolt optimization: Pre-allocate static Set at module scope to prevent re-instantiating Set object on every HTTP API request
const ALLOWED_PROVIDERS = new Set(['auto', 'gemini', 'openai', 'groq', 'nvidia']);

export async function POST(request) {
  try {
    // Security: Extract client IP address for rate limiting
    const clientIp = (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    ).trim();

    const { allowed, retryAfter } = checkRateLimit(clientIp);
    if (!allowed) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    }

    const body = await request.json();
    const { features } = body;

    if (!features || !Array.isArray(features) || features.length === 0) {
      return Response.json({ error: 'No features provided' }, { status: 400 });
    }

    if (features.length > 10) {
      return Response.json({ error: 'Maximum 10 features allowed per session' }, { status: 400 });
    }

    // Security: Validate and sanitize feature input elements
    const sanitizedFeatures = [];
    for (let i = 0; i < features.length; i++) {
      const item = features[i];
      if (!item || typeof item !== 'object') {
        return Response.json({ error: `Feature #${i + 1} must be a valid object` }, { status: 400 });
      }

      // Security: Strip control characters to prevent null byte/control string injection into LLM prompts & logs
      const stripCtrl = (s) => s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
      const name = typeof item.name === 'string' ? stripCtrl(item.name) : '';
      const description = typeof item.description === 'string' ? stripCtrl(item.description) : '';
      const category = typeof item.category === 'string' ? stripCtrl(item.category) : 'Other';

      if (!name) {
        return Response.json({ error: `Feature #${i + 1} requires a valid name` }, { status: 400 });
      }

      if (name.length > MAX_NAME_LENGTH || description.length > MAX_DESC_LENGTH || category.length > MAX_CAT_LENGTH) {
        return Response.json(
          { error: `Feature #${i + 1} exceeds max field length limits (Name: ${MAX_NAME_LENGTH}, Description: ${MAX_DESC_LENGTH}, Category: ${MAX_CAT_LENGTH})` },
          { status: 400 }
        );
      }

      sanitizedFeatures.push({ name, description, category });
    }

    // Extract & validate BYOK headers if passed by client (prevents parameter tampering & DoS via oversized keys)
    const rawProviderHeader = request.headers.get('x-provider') || 'auto';
    if (rawProviderHeader.length > 50) {
      return Response.json({ error: 'Provider header exceeds maximum permitted length (50 characters)' }, { status: 400 });
    }
    const rawProvider = rawProviderHeader.toLowerCase().trim();
    const userProvider = ALLOWED_PROVIDERS.has(rawProvider) ? rawProvider : 'auto';

    const rawApiKey = request.headers.get('x-api-key') || '';
    if (rawApiKey.length > 256) {
      return Response.json({ error: 'API key exceeds maximum permitted length (256 characters)' }, { status: 400 });
    }
    // Security: Strip all control characters (0x00-0x1F, 0x7F) from API key header to prevent header injection/pollution
    const userApiKey = rawApiKey.replace(/[\x00-\x1F\x7F]/g, '').trim();

    const { features: scoredFeatures, source } = await prioritizeFeatures({
      features: sanitizedFeatures,
      userProvider,
      userApiKey,
    });

    return Response.json({ features: scoredFeatures, model: source });
  } catch (error) {
    // Security: Return 400 Bad Request on malformed JSON payload instead of unhandled 500 error
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    // Security: Log actual error details internally, return sanitized message to client to prevent info leakage
    console.error('Prioritize API error:', error);

    return Response.json(
      { error: 'An unexpected error occurred while processing your request' },
      { status: 500 }
    );
  }
}
