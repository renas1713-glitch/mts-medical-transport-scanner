## 2024-06-13 - FlatList rendering optimization
**Learning:** FlatList re-renders can be significantly optimized by memoizing `renderItem` handlers with `useCallback`. This requires ensuring all dependencies like event handlers inside the component are also memoized.
**Action:** Apply `useCallback` to functions passed as `renderItem` props in FlatLists to preserve performance and prevent unnecessary re-rendering across list items.
