## 2024-05-18 - App.tsx Dashboard Stats Optimization
**Learning:** React component `App.tsx` computes derived state (number of settled trips, average confidence) inline during every render using multiple passes (`filter`, `reduce`). While not huge, combining these into a single pass or memoizing them with `useMemo` is cleaner and faster, especially if `trips` grows or renders often.
**Action:** Use `useMemo` for derived dashboard stats in `App.tsx` to avoid recalculating stats on every render cycle (e.g., when screen switches).
