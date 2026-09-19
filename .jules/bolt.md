## 2025-05-18 - Unmemoized Context Callbacks Trigger Cascading Data Re-fetches
**Learning:** In React context providers where consumers include context methods (e.g., `getUserHistory`) in `useEffect` dependency arrays, unmemoized context callbacks cause `useEffect` to re-trigger on every provider state change, leading to duplicate Firestore/localStorage reads and extra re-renders.
**Action:** Always wrap context methods in `useCallback` and the context provider value object in `useMemo` when context functions are passed into hook dependency arrays in consumer components.
