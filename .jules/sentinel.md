## 2025-05-18 - LLM Response Mass Assignment & Untrusted Output Property Injection
**Vulnerability:** External LLM JSON responses were mapped using object spread (`{ ...f, name, reach, ... }`), allowing unvetted properties or malicious property injections from model output/prompt injection into application state, storage, and exports.
**Learning:** Returning responses from external AI models with object spread bypasses type safety and allows unexpected or manipulated attributes (e.g., prototype pollution attempts, arbitrary key injection) to pollute downstream components.
**Prevention:** Always construct response objects explicitly with sanitized fields when ingesting untrusted LLM/API data rather than spreading raw JSON objects.
