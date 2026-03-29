# Mission Control — Changelog

This is a lightweight “what changed” log for fast handoffs and future upgrades.

## 2026-03-19
- Gateway origin allowlist added in OpenClaw config to support reverse-proxy access.
- Ops page: Cron Monitor sourced from Notion Cron Monitor DB (counts + table).
- Fixed Notion task writes: Tasks DB `Status` is **select** (not Notion “status”), so create/update now use `select` payload.
- Projects page: project detail modal (slick) + edit pillar/level/parent + list related tasks (by Notion relation: `Project`).

## 2026-03-23 → 2026-03-24
- Security: Cloudflare proxy enabled for `mc.taskcocoon.com` and Cloudflare Access gate added (OTP allowlist) to protect UI + `/api/*` routes.
- UI: Mobile nav drawer + top bar menu.
- Ops: Added Notion-backed **Ops Events** DB + Mission Control panels/API to display it.
  - DB created: `Ops Events` (`32cd081a-352a-81a3-ab82-c9ef942f5fc5`).
  - `/ops` now shows Ops Events feed; Activity feed includes Ops Events + cron status + task updates.
  - Cron status logger now writes to Ops Events (errors always; OK allowlist; recovery events).
- Projects: Added Notion-backed project metadata + links.
  - Projects DB schema updated with `Quick Summary`, `App URL`, `Repo URL`, `Docs URL`.
  - Project modal now shows Summary + App/Repo/Docs buttons.
  - Projects page upgraded to searchable/filterable card grid (shows all projects).
- News: Added `/news` page backed by Notion Content DB (link posts) with list view default + 7d/30d/all filter + headline search.
  - Display shows real chips (Source/Pillar/Business Value/Type) and sorts by `Submitted at`.
- Tasks: Replaced year countdown card with sporty chronograph-style T-minus (days:hrs:min:sec:cs) + progress bar + local/UTC.
- Agents: Added `/agents` read-only page (gateway health + agent events from Ops Events; live sessions later).
- Notion: Seeded/filled some project summaries + URLs (Birdie/TaskCocoon/TBot/Mission Control) + Repo URLs where found.
- Moltbook: Added `Moltbook` as a Content DB Source option and wired `scripts/moltbook_publish.py` to also log posts into Notion Content (best-effort). (Verification pending next scheduled Moltbook Daily Post run.)

## 2026-03-28 → 2026-03-29
- Dashboard: Ops highlights limited to last 24h; UI labeling added; card layout normalized; removed “Next moves” card; added **System status** strip.
- Ops: Data freshness hints; skills snapshot surfaced as chips; weekly Cron Monitor sync added.
- Pulse: `/pulse` page added (HN trending digest).
- Agents: Pivoted to curated summaries + recommendations (no live gateway sessions).
- News: Completion loop UI; WordPress URL linker; draft-ready indicator; Notion page URL exposed; link candidates cron now posts a one-line ping.
- Projects:
  - Project drawer (summary/links/metadata) + related tasks grouped by **Phase**.
  - Tasks DB: added `Phase` select.
  - Generate plan now schedules task due dates backwards from Project Due.
  - Generate plan is idempotent (fills missing tasks; avoids duplicates).
  - Added “Promote next 3” (Backlog → Todo).
  - Added “New project” drawer (+ deep-link open via `?open=<id>`).
- Reliability:
  - Daily “System health audit” cron + Telegram failure alert.
  - OpenClawd Digest persisted + pruned (60d) + logged to Ops Events.
  - Skills snapshot (daily) logged to Ops Events.
- Lint: relaxed noisy rules for dynamic parsing.

