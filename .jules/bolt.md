## 2024-10-26 - [TripCard component memoization]
**Learning:** Extracting an inline renderItem function from a FlatList into a React.memo wrapped component prevents the entire list from re-rendering when the parent state changes, saving significant CPU cycles on large lists.
**Action:** Always extract renderItem components and wrap them in React.memo, passing down useCallback-memoized event handlers.
