# Mission Control — Architecture

Mission Control is a Next.js web app (Vercel) that acts as a **cockpit UI** over two primary backends:

- **Notion** = canonical system of record for work (tasks, projects, cron monitor)
- **OpenClaw Gateway** = ops/control plane (status, sessions, etc.) exposed via Cloudflare Tunnel

This doc is here so future upgrades don’t require re-explaining context.

## Deployment

- **Frontend**: Next.js (App Router) deployed on **Vercel**
- **Public UI host**: `mc.taskcocoon.com`
- **Gateway host**: `gateway1.taskcocoon.com` (Cloudflare Tunnel → VM `127.0.0.1:18789`)

## Data Sources

### Notion (work plane)

Environment variables (Vercel):
- `NOTION_API_KEY`
- `NOTION_TASKS_DB`
- `NOTION_PROJECTS_DB`
- `NOTION_CRON_DB`

Used by:
- Tasks board (`/tasks`) — reads from Notion Tasks DB
- Projects view (`/projects`) — reads from Notion Projects DB
- Ops cron table (`/ops`) — reads from Notion Cron Monitor DB

**Important schema notes**
- Tasks DB `Status` is a **select** property (not Notion “status” type). Writes must use:
  - `Status: { select: { name: "Todo" } }`

### OpenClaw Gateway (ops plane)

Environment variables (Vercel):
- `OPENCLAW_GATEWAY_URL` (example: `https://gateway1.taskcocoon.com`)

Used by:
- `/ops` — basic gateway reachability and raw `/status` response (cron/cost currently sourced from Notion)

**Control UI access controls**
- The gateway is configured with a token + device pairing.
- Reverse-proxied access (Cloudflare) requires allowed origins (`gateway.controlUi.allowedOrigins`).

## App Structure

### Routes (UI)
- `/` → redirects to `/tasks`
- `/tasks` — tasks board + quick add + task detail modal
- `/projects` — projects tree view
- `/ops` — gateway status + Notion cron monitor summary + table

### Routes (API)
- `POST /api/tasks` — create task in Notion
- `PATCH /api/tasks/[id]` — update task status in Notion
- `GET /api/activity` — activity feed (currently derived from recent Notion task edits)

## Security / Secrets

- **Never commit tokens**. Only env var names belong in repo.
- Repo is public: keep `.env.example` non-sensitive.
- Gateway token + pairing approvals stay on the gateway host.

## Known Limitations (current)

- Drag-and-drop status changes are not implemented.
- Activity feed does not yet include ops events (cron runs, errors) — only Notion task edits.
- `costWeek` and other ops metrics are placeholders until wired to a real source.
