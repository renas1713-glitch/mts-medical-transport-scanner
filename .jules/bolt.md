## 2024-11-10 - Memoization pattern for lists
**Learning:** Extracted inline component `renderTripCard` from parent to prevent recreation on every render, and memoized it with `React.memo` to optimize `FlatList` performance. Defining renderers inside components creates a new type on every render.
**Action:** Always define `FlatList` item components outside of the main component and wrap them in `React.memo`.
