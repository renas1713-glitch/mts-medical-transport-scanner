## 2024-06-15 - React Native FlatList Re-renders
**Learning:** In React Native, inline functions for `renderItem` in `FlatList` cause every item to re-render when the parent component's state changes. Additionally, running expensive inline calculations (like array filtering and reducing) directly in the render path slows down the rendering phase.
**Action:** Always wrap `renderItem` handlers in `useCallback` and compute derived data with `useMemo` when rendering lists of items, especially in main navigation screens.
