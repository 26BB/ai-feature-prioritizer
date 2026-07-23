import nvidiaClient, { NVIDIA_MODEL } from '@/lib/nvidia';
import { buildRicePrompt } from '@/lib/prompts';

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

    const prompt = buildRicePrompt(features);

    const completion = await nvidiaClient.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a senior AI Product Manager specializing in RICE prioritization frameworks. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();

    if (!rawContent) {
      return Response.json({ error: 'Empty response from AI model' }, { status: 500 });
    }

    // ponytail: bracket extraction is robust against LLM preamble text; regex strip is brittle
    const startIndex = rawContent.indexOf('[');
    const endIndex = rawContent.lastIndexOf(']');
    const jsonStr = startIndex !== -1 && endIndex !== -1
      ? rawContent.substring(startIndex, endIndex + 1)
      : rawContent.trim();
    const scored = JSON.parse(jsonStr);

    // Sort by RICE score
    scored.sort((a, b) => b.rice_score - a.rice_score);

    return Response.json({ features: scored, model: NVIDIA_MODEL });
  } catch (error) {
    console.error('Prioritize API error:', error);

    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
    }

    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
