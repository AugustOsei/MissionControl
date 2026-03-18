# Mission Control (v2 rewrite)

This is **Mission Control v2**: a nerdy ops/work cockpit.

- **Work plane**: Notion-backed Projects + Tasks
- **Ops plane**: OpenClaw gateway (sessions / crons / cost)
- **UI**: Next.js app intended for deployment at `mc.taskcocoon.com`

## Local dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

- `NOTION_API_KEY` – Notion integration token
- `NOTION_TASKS_DB` – Notion Tasks database id
- `NOTION_PROJECTS_DB` – Notion Projects database id
- `OPENCLAW_GATEWAY_URL` – e.g. `https://gateway.taskcocoon.com` (after tunnel)

## Roadmap (near-term)

- Drag/drop board (dnd)
- Task status updates → Notion
- Projects drilldown (Parent → L1 → L2 → detail)
- Live Activity feed (ops + work + content)
- Cloudflare Tunnel + Access for `gateway.taskcocoon.com`
