# Mission Control

A nerdy ops/work cockpit.

- **Work plane**: Notion-backed Projects + Tasks
- **Ops plane**: OpenClaw gateway + Notion Cron Monitor (initially)
- **UI**: Next.js app deployed on Vercel (production: `mc.taskcocoon.com`)

## Read first

- License: `./LICENSE` (MIT)
- Architecture: `./ARCHITECTURE.md`
- Change log / handoff notes: `./CHANGELOG.md`

## Local dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

## What you get (current)

- **Dashboard (`/`)**: ops highlights (last 24h), focus list, intel, + system status strip (cron last/next/status).
- **Ops (`/ops`)**: Cron Monitor + Ops Events + skills snapshot + freshness hints.
- **News (`/news`)**: link-candidate pipeline with a completion loop, draft-ready indicator, and WordPress URL linker.
- **Projects (`/projects`)**: project drawer with summary/links + generate phased plan + promote next 3 tasks.
- **Tasks (`/tasks`)**: Notion-backed working queue.
- **Events (`/events`)**: due-date timeline.
- **Pulse (`/pulse`)**: HN trending digest.
- **Agents (`/agents`)**: OpenClawd Digest + rolled-up recent automation.

## Environment variables

Only env var **names** are stored in this repo (it’s public). Set values in Vercel.

### Required (Notion)
- `NOTION_API_KEY`
- `NOTION_TASKS_DB`
- `NOTION_PROJECTS_DB`
- `NOTION_CONTENT_DB`
- `NOTION_CRON_DB`
- `NOTION_OPS_EVENTS_DB`

### Optional
- `OPENCLAW_GATEWAY_URL`
- `NOTION_REVALIDATE_SECONDS` (default: 120)
- `NEXT_PUBLIC_SITE_URL` (recommended in hosted deployments)

### Calendar proxy (optional)
- `CALENDAR_PROXY_URL`
- `CALENDAR_PROXY_TOKEN`
- `CF_ACCESS_CLIENT_ID`
- `CF_ACCESS_CLIENT_SECRET`

