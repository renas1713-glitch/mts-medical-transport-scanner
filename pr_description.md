💡 What: Extracted `TripCard` into a standalone component wrapped in `React.memo`, memoized `renderItem` and `handleStartNavigation` with `useCallback`, and memoized statistics array calculations (`trips.filter` and `trips.reduce`) using `useMemo`.
🎯 Why: `App.tsx` previously redefined `renderTripCard` and re-evaluated `trips.reduce` and `trips.filter` on every render, causing O(N) recalculations and unnecessary re-renders of `FlatList` elements when switching screens.
📊 Impact: Eliminates redundant re-renders of list items and saves array iteration time during non-data state changes.
🔬 Measurement: Observe React DevTools Profiler; toggling between screens (e.g., opening the scanner and closing it) no longer forces `TripCard` components to re-render.
