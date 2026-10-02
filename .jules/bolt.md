## 2023-10-02 - React Native FlatList Optimization
**Learning:** FlatList's `renderItem` prop can be a major source of unnecessary re-renders in React Native if the function reference changes on every render.
**Action:** Always wrap `renderItem` functions (and any functions they depend on) with `useCallback` to provide a stable reference, preventing the entire list from re-rendering when the parent component's state changes.
