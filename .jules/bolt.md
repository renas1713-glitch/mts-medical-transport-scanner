## 2024-05-18 - App.tsx FlatList Re-renders
**Learning:** `App.tsx` renders a FlatList of trips. When properties of the dashboard update, `renderTripCard` gets recreated, causing re-renders of the list items. By extracting `TripCard` and memoizing it with `React.memo`, along with memoizing its callbacks, we can avoid this. Also we should memoize expensive derived state, like reduce calculations over lists.
**Action:** Extract list item components, memoize them with `React.memo` and wrap inline arrow functions with `useCallback`. Memoize expensive reduce calls using `useMemo`.
