## 2024-05-18 - FlatList Render Optimization in App.tsx
**Learning:** The `renderItem` function and stats calculations in `App.tsx` were defined inline, causing unnecessary recalculations and re-renders for the `FlatList` component every time the component state updated.
**Action:** Use `useCallback` for `renderItem` and `keyExtractor`, and `useMemo` for derived dashboard statistics to ensure referential stability and prevent wasted render cycles.
