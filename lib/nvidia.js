import { OpenAI } from 'openai';

// ponytail: fallback dummy key prevents `new OpenAI()` from throwing during Next.js static build phase
const client = new OpenAI({
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY || 'dummy_key_for_build_phase',
});

export const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

export default client;
