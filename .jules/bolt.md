## 2025-02-18 - Replacing N+1 Network Calls with Bulk Upsert
**Learning:** In `utils/databaseManager.ts`, offline trips were previously being synchronized by iterating over them and making individual `upsert` API requests to Supabase (an O(N) network call anti-pattern). Supabase's `upsert` naturally supports bulk inserts with arrays.
**Action:** Always verify if an API client supports batching/array insertion before using loops to perform network operations, especially when syncing locally cached state with a remote backend to dramatically reduce the number of required connections.
