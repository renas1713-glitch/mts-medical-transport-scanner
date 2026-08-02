
## 2023-10-27 - FlatList and Memoization Optimization
**Learning:** Re-renders of large lists (`FlatList` in React Native) can severely impact dashboard performance, especially if anonymous functions are passed to item renders. Additionally, calculating statistics (like accuracy and count) during every re-render of `App.tsx` can block the main UI thread as lists grow.
**Action:** Extract list item components out into `React.memo` wrappers, use `useCallback` for functions passed as props to list items (e.g. navigation handlers), and memoize expensive dashboard computations (like O(N) `.reduce` operations over arrays) using `useMemo`.
