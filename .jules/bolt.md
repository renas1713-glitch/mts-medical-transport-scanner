## 2023-11-05 - Extracted and Memoized TripCard
**Learning:** In React Native lists (like `FlatList`), defining `renderItem` inline or inside the main component body recreates the render function and component structure on every parent re-render, leading to unnecessary re-renders of list items.
**Action:** Always extract complex list item components outside of the parent function and wrap them in `React.memo()`, and pass `useCallback` for functions passed as props to avoid inline function recreations.
