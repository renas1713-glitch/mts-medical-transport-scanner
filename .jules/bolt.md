## 2024-05-01 - Optimizing FlatList with useCallback
**Learning:** `renderItem` in `FlatList` can cause unnecessary re-renders of all items if not memoized, especially if it relies on functions inside the main component scope (like `handleStartNavigation`). Memoizing `renderItem` using `useCallback` is a standard optimization in React Native.
**Action:** Use `useCallback` to wrap the `renderItem` function and its dependencies.
