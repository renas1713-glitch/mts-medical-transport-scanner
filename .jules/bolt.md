## 2024-05-18 - [Optimization] React Native FlatList Performance
**Learning:** In App.tsx, the renderItem function for FlatList is recreated on every render. For lists, this can cause unnecessary re-renders of list items.
**Action:** Use useCallback to memoize the renderItem function to improve performance of the FlatList.
