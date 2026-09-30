## 2024-05-20 - Memoizing FlatList items with React.memo
**Learning:** Wrapping a FlatList's `renderItem` function with `useCallback` alone is not enough to prevent re-renders of the list items; the items themselves must be extracted into a separate component wrapped with `React.memo` (and its dependencies memoized with `useCallback`). This is a critical React Native performance pattern for large lists.
**Action:** Always extract complex inline elements rendered in FlatList to `React.memo` components, passing callbacks wrapped in `useCallback`.
