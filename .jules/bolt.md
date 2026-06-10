## 2025-02-24 - Memoizing FlatList items and derived state
**Learning:** Defining render items inline in a FlatList or doing array aggregations directly in the render loop causes significant performance issues in React Native as the list grows, leading to unnecessary re-renders.
**Action:** Always extract FlatList items into separate React.memo components and use useMemo for expensive derived state calculations (like array filtering/reducing) to improve list rendering performance.
