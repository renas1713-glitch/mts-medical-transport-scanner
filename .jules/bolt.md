## 2026-06-14 - Expensive computations in render loops
**Learning:** Found O(N) array operations (`reduce` and `filter`) running directly in the render function of the `App` component, which could cause lag on the main thread as the list of trips grows.
**Action:** Always wrap array reductions, mapping, and filtering operations in `useMemo` if they are derived from state, especially in dashboard-like components that might re-render frequently.
