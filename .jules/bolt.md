## 2025-02-12 - React Native FlatList Performance Bottleneck
**Learning:** Extracting list item rendering functions (like `renderTripCard`) into their own top-level components and wrapping them in `React.memo` drastically reduces re-renders in `FlatList`. A common anti-pattern is leaving these components inline within the main Component, causing unneeded rendering when parent state changes.
**Action:** When working with large lists, strictly extract item rendering into separate memoized components and wrap `renderItem` using `useCallback` to prevent list items from re-rendering unnecessairly.
