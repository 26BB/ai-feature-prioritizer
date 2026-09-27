## 2025-05-18 - LLM Response Mass Assignment & Untrusted Output Property Injection
**Vulnerability:** External LLM JSON responses were mapped using object spread (`{ ...f, name, reach, ... }`), allowing unvetted properties or malicious property injections from model output/prompt injection into application state, storage, and exports.
**Learning:** Returning responses from external AI models with object spread bypasses type safety and allows unexpected or manipulated attributes (e.g., prototype pollution attempts, arbitrary key injection) to pollute downstream components.
**Prevention:** Always construct response objects explicitly with sanitized fields when ingesting untrusted LLM/API data rather than spreading raw JSON objects.

## 2025-05-19 - BYOK API Key Misrouting & Third-Party Credential Leakage
**Vulnerability:** When `userProvider` was set to `'auto'`, any client-provided `userApiKey` in `x-api-key` headers defaulted to OpenAI (`https://api.openai.com/v1`), inadvertently transmitting credentials intended for other providers (e.g. Gemini, Groq, NVIDIA) to OpenAI endpoints.
**Learning:** Defaulting unvalidated provider configurations to a hardcoded endpoint (e.g. OpenAI) when BYOK keys are passed can lead to cross-provider API key exposure.
**Prevention:** Strictly validate that `userProvider` matches a valid BYOK provider configuration and is not `'auto'` before executing BYOK API requests.
