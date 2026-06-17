## 2024-05-19 - Concurrent DB Sync Optimization
**Learning:** Sequential network requests in `syncPendingTrips` caused an N+1 bottleneck when syncing cached trips to Supabase.
**Action:** Use `Promise.all` with `Array.prototype.map` to batch and execute network requests concurrently. Ensure to properly evaluate overall state modifications (`hasChanges`) based on all settled promises.
