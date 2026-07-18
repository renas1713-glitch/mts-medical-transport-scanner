## 2024-05-18 - Avoid O(N) in Render and React Native FlatList
**Learning:** Found O(N) array operations (filter, reduce) running inline during every render of the root App component, plus a non-memoized `renderItem` function passed to FlatList, causing unnecessary recalculations and FlatList re-renders on screen transitions.
**Action:** Use `useMemo` for derived array stats and `useCallback` for `FlatList` `renderItem` to prevent expensive re-rendering cascades in React Native.
