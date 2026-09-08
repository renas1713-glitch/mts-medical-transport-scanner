## 2024-05-30 - Re-rendering performance Issue
**Learning:** Unnecessary list item re-rendering without useCallback in React Native
**Action:** Add useCallback in renderItem of FlatList to prevent re-creation on every render.
