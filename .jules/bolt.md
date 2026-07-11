## 2024-07-11 - FlatList Re-render Optimization
**Learning:** In a React Native `FlatList`, providing a new inline function for `renderItem` on every render of the parent component forces all list items to re-render unnecessarily during state updates (e.g., when the current screen changes).
**Action:** Always wrap `renderItem` functions (and any functions they depend on, like button handlers) in `useCallback`.
