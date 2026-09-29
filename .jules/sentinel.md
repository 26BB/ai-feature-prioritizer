## 2025-05-18 - LLM Response Mass Assignment & Untrusted Output Property Injection
**Vulnerability:** External LLM JSON responses were mapped using object spread (`{ ...f, name, reach, ... }`), allowing unvetted properties or malicious property injections from model output/prompt injection into application state, storage, and exports.
**Learning:** Returning responses from external AI models with object spread bypasses type safety and allows unexpected or manipulated attributes (e.g., prototype pollution attempts, arbitrary key injection) to pollute downstream components.
**Prevention:** Always construct response objects explicitly with sanitized fields when ingesting untrusted LLM/API data rather than spreading raw JSON objects.

## 2025-05-19 - BYOK API Key Misrouting & Third-Party Credential Leakage
**Vulnerability:** When `userProvider` was set to `'auto'`, any client-provided `userApiKey` in `x-api-key` headers defaulted to OpenAI (`https://api.openai.com/v1`), inadvertently transmitting credentials intended for other providers (e.g. Gemini, Groq, NVIDIA) to OpenAI endpoints.
**Learning:** Defaulting unvalidated provider configurations to a hardcoded endpoint (e.g. OpenAI) when BYOK keys are passed can lead to cross-provider API key exposure.
**Prevention:** Strictly validate that `userProvider` matches a valid BYOK provider configuration and is not `'auto'` before executing BYOK API requests.

## 2025-05-20 - Firestore Document Path Traversal in Subcollection Operations
**Vulnerability:** Unsanitized document IDs passed to `doc(db, 'users', uid, 'history', id)` allowed relative path sequences (`..`), enabling path traversal outside the user's `history` subcollection and unauthorized document deletion.
**Learning:** Firestore `doc()` parses path strings and interprets `/` and `..` relative path segments, allowing callers to escape subcollections if document IDs are not strictly validated.
**Prevention:** Validate that document ID parameters strictly match expected alphanumeric format (e.g., `/^[a-zA-Z0-9_-]+$/`) before constructing Firestore document references.

## 2025-05-21 - Unbounded In-Memory Client Cache DoS & Credential Retention
**Vulnerability:** Dynamic LLM client instances were cached in a global `Map` keyed by `${baseURL}:${apiKey}` without size limits or eviction policy, allowing callers sending unique `x-api-key` headers to cause heap memory exhaustion DoS and retain sensitive BYOK keys indefinitely in process memory.
**Learning:** Caching objects keyed by untrusted user headers in global maps creates an unbounded memory growth vector (CWE-400) and leads to long-term credential retention in process heap memory.
**Prevention:** Bound all module-level caches with explicit capacity limits and FIFO/LRU eviction policies to prevent memory leaks and ensure credential eviction.
