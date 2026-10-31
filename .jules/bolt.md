
## 2024-05-18 - Memoizing FlatList renderItem in App.tsx
**Learning:** Extracting an inline `renderItem` function from a `FlatList` into a separate memoized component, and wrapping its dependencies (e.g. `handleStartNavigation`) in `useCallback` significantly improves performance by preventing unnecessary re-renders of the list items whenever the parent `App` component's state changes.
**Action:** When working with `FlatList`, always extract the `renderItem` logic into a separate `React.memo` component outside the parent and use `useCallback` for event handlers passed down to it.
