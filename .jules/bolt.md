## 2024-07-27 - Extracting inline FlatList components to React.memo
**Learning:** Found an inline `renderTripCard` in `App.tsx` that causes unnecessary re-renders of all list items whenever the `App` component state (like `currentScreen` or the full list of `trips`) changes.
**Action:** Extract components passed to `renderItem` into separate top-level components and wrap them in `React.memo` to optimize React Native FlatList performance, especially as list size grows.
