## 2025-07-08 - React Native FlatList renderItem anti-pattern
**Learning:** Found an inline, unmemoized `renderItem` function passed to a `FlatList` in `App.tsx`, and expensive array reductions happening on every render. This causes all items in the list to needlessly re-render every time the `App` component state changes, which causes frame drops on long lists.
**Action:** Always wrap `renderItem` functions in `useCallback` or extract them to separate components outside the parent component to avoid unnecessary re-renders. Also, use `useMemo` for derived statistics that iterate over arrays.
