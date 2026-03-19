# Mission Control

A nerdy ops/work cockpit.

- **Work plane**: Notion-backed Projects + Tasks
- **Ops plane**: OpenClaw gateway + Notion Cron Monitor (initially)
- **UI**: Next.js app deployed on Vercel (production: `mc.taskcocoon.com`)

## Read first

- Architecture: `./ARCHITECTURE.md`
- Change log / handoff notes: `./CHANGELOG.md`

## Local dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

Only env var **names** are stored in this repo (it’s public). Set values in Vercel.

- `NOTION_API_KEY`
- `NOTION_TASKS_DB`
- `NOTION_PROJECTS_DB`
- `NOTION_CRON_DB`
- `OPENCLAW_GATEWAY_URL`
