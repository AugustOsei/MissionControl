# Mission Control — Changelog

This is a lightweight “what changed” log for fast handoffs and future upgrades.

## 2026-03-19
- Gateway origin allowlist added in OpenClaw config to support reverse-proxy access.
- Ops page: Cron Monitor sourced from Notion Cron Monitor DB (counts + table).
- Fixed Notion task writes: Tasks DB `Status` is **select** (not Notion “status”), so create/update now use `select` payload.
