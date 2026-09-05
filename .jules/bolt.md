## 2024-05-19 - Exhaustive dependencies with useCallback
**Learning:** When using `useCallback` or `useMemo` in React components, ensure that all local functions referenced within the callback (like `handleStartNavigation`) are also memoized and included in the dependency array to avoid stale closures and violations of `react-hooks/exhaustive-deps`.
**Action:** Always verify the full dependency tree of any memoized callback to guarantee that nested functions are also wrapped in `useCallback` before adding them to the dependency array.
