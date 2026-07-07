## 2026-07-07 - Memoization in FlatLists
**Learning:** In React Native applications using FlatList, inline filter and reduce operations over lists during stats calculations cause O(N) recalculations on every single render. Additionally, passing inline arrow functions for `renderItem` breaks FlatList's internal optimizations and forces full re-renders of all items.
**Action:** Always extract list-wide calculations into a `useMemo` hook bounded by the list dependency, and wrap `renderItem` callbacks in `useCallback` when the child components are memoized or complex.
