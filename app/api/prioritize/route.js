import { prioritizeFeatures } from '@/lib/llmProviders';

// Max input character lengths to prevent DoS and prompt injection risks
const MAX_NAME_LENGTH = 200;
const MAX_DESC_LENGTH = 1000;
const MAX_CAT_LENGTH = 100;

export async function POST(request) {
  try {
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

      const name = typeof item.name === 'string' ? item.name.trim() : '';
      const description = typeof item.description === 'string' ? item.description.trim() : '';
      const category = typeof item.category === 'string' ? item.category.trim() : 'Other';

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
    const rawProvider = (request.headers.get('x-provider') || 'auto').toLowerCase().trim();
    const ALLOWED_PROVIDERS = new Set(['auto', 'gemini', 'openai', 'groq', 'nvidia']);
    const userProvider = ALLOWED_PROVIDERS.has(rawProvider) ? rawProvider : 'auto';

    const rawApiKey = request.headers.get('x-api-key') || '';
    if (rawApiKey.length > 256) {
      return Response.json({ error: 'API key exceeds maximum permitted length (256 characters)' }, { status: 400 });
    }
    const userApiKey = rawApiKey.replace(/[\r\n\t]/g, '').trim();

    const { features: scoredFeatures, source } = await prioritizeFeatures({
      features: sanitizedFeatures,
      userProvider,
      userApiKey,
    });

    return Response.json({ features: scoredFeatures, model: source });
  } catch (error) {
    // Security: Log actual error details internally, return sanitized message to client to prevent info leakage
    console.error('Prioritize API error:', error);

    return Response.json(
      { error: 'An unexpected error occurred while processing your request' },
      { status: 500 }
    );
  }
}
