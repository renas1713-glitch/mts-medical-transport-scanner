## 2024-05-24 - Memoize Stats Calculation in Dashboard
**Learning:** Computing statistics by mapping and reducing a potentially large array of trips on every render can cause unnecessary overhead, especially in the main Dashboard view of a React Native app where UI responsiveness is key.
**Action:** Use `useMemo` to cache derived state like aggregate statistics from list data so it only recalculates when the data actually changes.
