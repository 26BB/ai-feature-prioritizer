## 2025-05-18 - Unmemoized Context Callbacks Trigger Cascading Data Re-fetches
**Learning:** In React context providers where consumers include context methods (e.g., `getUserHistory`) in `useEffect` dependency arrays, unmemoized context callbacks cause `useEffect` to re-trigger on every provider state change, leading to duplicate Firestore/localStorage reads and extra re-renders.
**Action:** Always wrap context methods in `useCallback` and the context provider value object in `useMemo` when context functions are passed into hook dependency arrays in consumer components.

## 2025-05-19 - Unmemoized Form Item Cards Cause Full Array Re-renders on Keystrokes
**Learning:** In dynamic form lists (e.g., feature input cards), updating state via `setFeatures(features.map(...))` without memoized item components forces React to re-render every card in the array on every keystroke. Using `React.memo` on list item cards combined with zero-dependency `useCallback` functional state updates (`setFeatures((prev) => ...)`) guarantees that unedited item card instances retain reference equality and skip re-renders completely during form input.
**Action:** Always extract dynamic list items into `React.memo` components and pass stable `useCallback` handlers using functional state updates when items hold editable form inputs.

## 2025-05-20 - Uncached LLM Client Instantiation Destroys HTTP Keep-Alive Connection Pools
**Learning:** Instantiating `new OpenAI(...)` inside per-request API handler functions recreates the HTTP agent and tears down sockets on every invocation, adding ~100–300ms TCP/TLS handshake latency to every call. Caching SDK client instances in a module-level Map by `baseURL` and `apiKey` preserves internal HTTP Keep-Alive connection pools across requests.
**Action:** Always cache LLM/API SDK client instances at module scope by endpoint and credential key instead of creating new client instances inside request handlers.
