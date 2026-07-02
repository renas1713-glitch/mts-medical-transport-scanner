## 2024-07-02 - Bolt Initialization
**Learning:** Initialized Bolt journal.
**Action:** Ready to log critical learnings.
## 2024-07-02 - React Native FlatList Memoization & Multi-Pass Array Reductions
**Learning:** Combining multiple array iterations (`filter`, `reduce`) into a single O(n) loop within a `useMemo` block significantly reduces CPU load during frequent dashboard renders. Wrapping `renderItem` (like `renderTripCard`) and its dependent functions in `useCallback` is critical for preventing unnecessary recreation and re-rendering of `FlatList` elements.
**Action:** Always combine multi-metric calculations into a single O(n) pass using `useMemo` for derived states based on arrays. Always wrap `renderItem` functions in `useCallback` when passed to a `FlatList` component to preserve reference equality.
