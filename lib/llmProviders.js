import { OpenAI } from 'openai';
import { buildRicePrompt } from './prompts';

// Provider endpoints configuration
const PROVIDER_CONFIGS = {
  nvidia: {
    baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    model: process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
    envKey: process.env.NVIDIA_API_KEY,
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: 'gemini-1.5-flash',
    envKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    envKey: process.env.GROQ_API_KEY,
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    envKey: process.env.OPENAI_API_KEY,
  },
};

/**
 * Deterministic fallback scoring engine when AI providers are rate-limited or unavailable
 */
export function calculateFallbackRice(features) {
  return features.map((f) => {
    // Estimate baseline heuristics based on category & text complexity
    const isHighImpactCategory = ['AI/ML', 'Growth', 'Security'].includes(f.category);
    const reach = isHighImpactCategory ? 8 : 6;
    const impact = isHighImpactCategory ? 8 : 5;
    const confidence = 80;
    const effort = f.description && f.description.length > 100 ? 5 : 3;

    const rice_score = Math.round((reach * impact * confidence) / effort);

    let sprint = 'NEXT';
    if (rice_score > 500 && effort <= 5) sprint = 'NOW';
    else if (rice_score < 200 || effort > 7) sprint = 'LATER';

    return {
      name: f.name,
      reach,
      impact,
      confidence,
      effort,
      rice_score,
      sprint,
      reasoning: `Score computed via Fallback Engine for "${f.name}". High baseline estimated for ${f.category} with ${confidence}% confidence.`,
      risks: ['AI Rate Limit Fallback Enabled', 'Standard Heuristic Estimation'],
      category: f.category || 'Other',
    };
  }).sort((a, b) => b.rice_score - a.rice_score);
}

// Bolt optimization: Cache OpenAI client instances by baseURL & apiKey to enable HTTP Keep-Alive connection pooling across requests (~100-300ms faster response)
const openAiClientCache = new Map();

function getOpenAiClient(baseURL, apiKey) {
  const cacheKey = `${baseURL}|${apiKey}`;
  let client = openAiClientCache.get(cacheKey);
  if (!client) {
    client = new OpenAI({ baseURL, apiKey });
    openAiClientCache.set(cacheKey, client);
  }
  return client;
}

/**
 * Helper to call an OpenAI-compatible endpoint
 */
async function callOpenAiCompatible({ baseURL, apiKey, model, prompt }) {
  const client = getOpenAiClient(baseURL, apiKey);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a senior AI Product Manager specializing in RICE prioritization frameworks. Always respond with valid JSON array only, no markdown formatting.',
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
  if (!rawContent) throw new Error('Empty response from model');

  const startIndex = rawContent.indexOf('[');
  const endIndex = rawContent.lastIndexOf(']');
  const jsonStr = startIndex !== -1 && endIndex !== -1
    ? rawContent.substring(startIndex, endIndex + 1)
    : rawContent.trim();

  const parsed = JSON.parse(jsonStr);
  // Security: Extract array if LLM wraps array inside an object (e.g. { features: [...] })
  const scored = Array.isArray(parsed) ? parsed : (parsed?.features || parsed?.data || parsed?.items);

  if (!Array.isArray(scored)) {
    throw new Error('LLM response structure is not a valid array');
  }

  // Security & Data Integrity: Explicitly map and sanitize expected fields from untrusted LLM response
  const sanitized = scored.map((f) => {
    const item = f && typeof f === 'object' ? f : {};
    const reach = Number.isFinite(Number(item.reach)) ? Number(item.reach) : 5;
    const impact = Number.isFinite(Number(item.impact)) ? Number(item.impact) : 5;
    const confidence = Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 80;
    const effort = Number.isFinite(Number(item.effort)) && Number(item.effort) > 0 ? Number(item.effort) : 3;
    const computedScore = Math.round((reach * impact * confidence) / effort);
    const rice_score = Number.isFinite(Number(item.rice_score)) ? Number(item.rice_score) : computedScore;

    const rawSprint = String(item.sprint || 'LATER').toUpperCase();
    const sprint = ['NOW', 'NEXT', 'LATER'].includes(rawSprint) ? rawSprint : 'LATER';

    const reasoning = typeof item.reasoning === 'string' ? item.reasoning.trim() : '';
    const category = typeof item.category === 'string' ? item.category.trim() : 'Other';
    const risks = Array.isArray(item.risks)
      ? item.risks.map((r) => String(r).trim()).filter(Boolean)
      : [];

    return {
      name: String(item.name || 'Untitled Feature').trim(),
      reach,
      impact,
      confidence,
      effort,
      rice_score,
      sprint,
      reasoning,
      risks,
      category,
    };
  });

  sanitized.sort((a, b) => b.rice_score - a.rice_score);
  return sanitized;
}

/**
 * Prioritize features using BYOK user key OR server provider fallback sequence
 */
export async function prioritizeFeatures({ features, userProvider, userApiKey }) {
  const prompt = buildRicePrompt(features);

  // 1. If User Provided BYOK Key
  if (userApiKey && userApiKey.trim()) {
    const provider = userProvider && Object.prototype.hasOwnProperty.call(PROVIDER_CONFIGS, userProvider) ? userProvider : 'openai';
    const config = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.openai;
    try {
      const result = await callOpenAiCompatible({
        baseURL: config.baseURL,
        apiKey: userApiKey.trim(),
        model: config.model,
        prompt,
      });
      return { features: result, source: `BYOK (${provider.toUpperCase()})` };
    } catch (err) {
      console.warn(`BYOK (${provider}) failed:`, err.message);
      // Fall through to server providers or fallback
    }
  }

  // 2. Server Chain: Try NVIDIA -> Gemini -> Groq -> OpenAI
  const serverProviders = ['nvidia', 'gemini', 'groq', 'openai'];

  for (const providerKey of serverProviders) {
    const config = PROVIDER_CONFIGS[providerKey];
    if (config.envKey && config.envKey !== 'dummy_key_for_build_phase') {
      try {
        const result = await callOpenAiCompatible({
          baseURL: config.baseURL,
          apiKey: config.envKey,
          model: config.model,
          prompt,
        });
        return { features: result, source: `Server (${providerKey.toUpperCase()})` };
      } catch (err) {
        console.warn(`Server provider (${providerKey}) failed:`, err.message);
      }
    }
  }

  // 3. Guaranteed Deterministic Fallback
  console.info('All AI providers exhausted. Using Deterministic RICE Engine.');
  const fallbackFeatures = calculateFallbackRice(features);
  return { features: fallbackFeatures, source: 'Offline Fallback Engine' };
}
