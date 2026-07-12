## 2025-07-12 - [React.memo missing on Trip Card]
**Learning:** Found that FlatList renderItem inline function `renderTripCard` in `App.tsx` was causing re-renders because it was unmemoized. `FlatList` optimizations require stable references for its `renderItem` prop, else it thinks every item changed when the parent updates.
**Action:** Applied `useCallback` to `renderTripCard` and `handleStartNavigation` to prevent this.
