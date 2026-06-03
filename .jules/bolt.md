## 2024-05-15 - React Component Optimization: App.tsx FlatList
**Learning:** Found a common performance issue in React Native where a FlatList uses an inline renderItem function that is not memoized. Every time App re-renders, renderTripCard is recreated, which can cause all items in the FlatList to re-render needlessly.
**Action:** Wrap the function in useCallback or extract renderTripCard to a standalone component and wrap it in React.memo.
