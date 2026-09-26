## 2025-05-18 - Unmemoized Context Callbacks Trigger Cascading Data Re-fetches
**Learning:** In React context providers where consumers include context methods (e.g., `getUserHistory`) in `useEffect` dependency arrays, unmemoized context callbacks cause `useEffect` to re-trigger on every provider state change, leading to duplicate Firestore/localStorage reads and extra re-renders.
**Action:** Always wrap context methods in `useCallback` and the context provider value object in `useMemo` when context functions are passed into hook dependency arrays in consumer components.

## 2025-05-19 - Unmemoized Form Item Cards Cause Full Array Re-renders on Keystrokes
**Learning:** In dynamic form lists (e.g., feature input cards), updating state via `setFeatures(features.map(...))` without memoized item components forces React to re-render every card in the array on every keystroke. Using `React.memo` on list item cards combined with zero-dependency `useCallback` functional state updates (`setFeatures((prev) => ...)`) guarantees that unedited item card instances retain reference equality and skip re-renders completely during form input.
**Action:** Always extract dynamic list items into `React.memo` components and pass stable `useCallback` handlers using functional state updates when items hold editable form inputs.

## 2025-05-20 - Inline Callbacks Defeat React.memo on Closed Modal Components During Keystrokes
**Learning:** Even when modal components (`ApiKeyModal`, `AuthModal`) are wrapped in `React.memo`, passing inline functions like `onClose={() => setIsModalOpen(false)}` creates new function references on every parent state update (such as typing in form fields). This forces React to re-evaluate closed modal components on every keystroke. Wrapping modal close handlers in `useCallback` preserves reference equality and allows `React.memo` to skip closed modal function calls entirely.
**Action:** Pair `React.memo` on modal components with `useCallback` handlers in parent components to prevent unnecessary re-evaluations during high-frequency parent state changes.
