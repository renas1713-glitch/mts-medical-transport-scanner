## 2024-05-18 - Supabase Background Sync Bottleneck
**Learning:** `syncPendingTrips` iteratively uploaded unsynced trips sequentially, resulting in O(N) network requests. Supabase `upsert` natively supports arrays, which can handle bulk inserts efficiently in a single network request.
**Action:** When saving multiple entities to Supabase, utilize array passing for `.upsert(dbTrips)` to batch network requests.
