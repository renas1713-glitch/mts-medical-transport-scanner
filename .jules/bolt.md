## 2024-05-18 - Memoize FlatList items
**Learning:** In React Native, `FlatList` performance can degrade if render items are re-created on every parent render.
**Action:** Extract list item rendering to a standalone `React.memo` component and wrap the rendering function and callbacks in `useCallback` to prevent unnecessary re-renders of the list items when unrelated parent state changes.
