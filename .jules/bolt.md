## 2025-02-28 - React Native FlatList Optimization
**Learning:** In React Native, FlatList re-renders can be expensive. Passing unmemoized functions or inline arrow functions as `renderItem` causes all list items to re-render when the parent component re-renders (e.g. state changes).
**Action:** Always wrap `renderItem` functions with `useCallback` and ensure all dependencies are also memoized (e.g., `handleStartNavigation` wrapped in `useCallback`) to prevent unnecessary `FlatList` recalculations.
