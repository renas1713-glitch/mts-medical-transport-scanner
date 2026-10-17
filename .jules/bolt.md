
## 2024-05-30 - [React Native FlatList Performance]
**Learning:** In React Native, the `renderItem` function passed to `FlatList` can cause unnecessary re-renders of list items if it's recreated on every component render.
**Action:** Always wrap `renderItem` with `useCallback` and ensure all its dependencies (like event handlers) are also memoized to optimize `FlatList` scrolling performance.
