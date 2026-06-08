## 2024-05-24 - React Native FlatList Performance
**Learning:** React Native's `FlatList` will trigger a re-render for all items if the `renderItem` function or its dependencies are re-created on each render of the parent component.
**Action:** Extract list item logic into a separate component wrapped with `React.memo()`. Memoize the `renderItem` function and any callback functions passed to the list item using `useCallback()` to ensure stable references and prevent unnecessary re-renders when the parent component updates.
