## 2024-05-18 - App List Optimization
**Learning:** React Native's FlatList performance degrades when inline functions are used for renderItem, combined with expensive calculations (like reducing arrays for dashboard stats) during every render cycle.
**Action:** Extract list items to `React.memo` components, use `React.useCallback` for functions passed to list items, and use `React.useMemo` for array-reducing calculations that derive state to prevent O(N) ops on every re-render.
