## 2024-11-01 - Initial Setup
**Learning:** Initializing journal for critical performance learnings.
**Action:** Add to this file when a unique performance bottleneck or surprising edge case is discovered in this codebase.

## 2024-11-01 - React.memo inside functional component
**Learning:** Found an inline render function (`renderTripCard`) creating new component types inside the `App` component's body.
**Action:** Extract this function into a separate `React.memo` wrapped component outside of `App` to prevent unnecessary unmount/remount cycles. Ensure dependencies like `handleStartNavigation` are passed as props or memoized if needed.
