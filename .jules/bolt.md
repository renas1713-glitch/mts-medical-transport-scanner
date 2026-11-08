## 2026-11-08 - Memoize FlatList renderItem component outside parent
**Learning:** Defining a component inside a parent component (like renderTripCard inside App) creates a new component type on every render, causing React to unmount and remount components in FlatList, which destroys performance.
**Action:** Always define child components outside of the parent functional component and wrap them in React.memo for FlatList renderItem.
