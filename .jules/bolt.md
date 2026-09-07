## 2023-11-20 - FlatList Inline Render Functions Cause Re-renders
**Learning:** Found that inline render functions passed to FlatList (like `renderItem`) without memoization cause the entire list to re-render whenever the parent component state changes. This is a crucial React Native performance anti-pattern.
**Action:** Always wrap `renderItem` functions in `useCallback` when using `FlatList`, and ensure all dependencies (including other local callback functions) are correctly specified in the dependency array.
