## 2024-05-19 - React Native FlatList Optimization
**Learning:** FlatList re-renders the entire list if `renderItem` is an inline function or a non-memoized function defined in a parent component that re-renders frequently (e.g. state changes). Array calculations inline in the JSX are evaluated on every render.
**Action:** Always wrap the `renderItem` function for `FlatList` with `useCallback` to maintain referential equality across parent renders. Use `useMemo` for any complex operations derived from state or props that don't need to be run on every render.
