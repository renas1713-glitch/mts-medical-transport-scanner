## 2024-05-19 - Removed useCallback for flatlist render item

**Learning:** FlatList `renderItem` methods can have stale closures if they rely on component state or functions (like `handleStartNavigation`) and are memoized without proper dependency tracking.
**Action:** Be extremely careful when using `useCallback` on `renderItem` methods. It often requires memoizing all dependencies recursively, which is counterproductive and error-prone. Usually it's better to memoize child components using `React.memo`.
