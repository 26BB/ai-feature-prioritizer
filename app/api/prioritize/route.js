import { prioritizeFeatures } from '@/lib/llmProviders';

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

    // Extract BYOK headers if passed by client
    const userProvider = request.headers.get('x-provider') || 'auto';
    const userApiKey = request.headers.get('x-api-key') || '';

    const { features: scoredFeatures, source } = await prioritizeFeatures({
      features,
      userProvider,
      userApiKey,
    });

    return Response.json({ features: scoredFeatures, model: source });
  } catch (error) {
    console.error('Prioritize API error:', error);

    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
