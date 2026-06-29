## 2026-06-29 - Backend Sync Optimization
**Learning:** Offline-first queues triggering N sequential requests cause an N+1 API waterfall on mobile networks.
**Action:** Always utilize batch database calls (e.g., Supabase batch upsert) when processing background queues to optimize mobile network efficiency.
