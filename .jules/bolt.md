## 2024-05-15 - React Native render optimizations
**Learning:** Avoid passing anonymous functions or inline object creation as props inside React Native `FlatList` components, particularly the `renderItem` prop, to prevent unnecessary re-renders. Use `React.memo()` and `useCallback` when dealing with complex objects passed in lists.
**Action:** Extract `renderTripCard` into a separate `React.memo` component in `App.tsx`.
