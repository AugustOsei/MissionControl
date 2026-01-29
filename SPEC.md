# Mission Control App - Specification

A dashboard to see all August Wheel tasks, reminders, projects, and progress at a glance.

## Vision

One place to see:
- **Active Projects** (blog, lead gen, client pipelines)
- **This Week's Tasks** (what needs doing)
- **Upcoming Reminders** (when things are due)
- **Key Metrics** (blog views, prospects, engagement)
- **My Recommendations** (what August thinks you should focus on)

## Core Features

### Dashboard Layout

```
MISSION CONTROL: AUGUST WHEEL
═══════════════════════════════════

📊 QUICK STATS
├─ Blog Posts This Month: 3
├─ Prospects in Pipeline: 5
├─ Blog Views (7-day): 342
└─ Next Briefing: Tomorrow 8 AM

📋 THIS WEEK'S TASKS
├─ [ ] Write blog post on "AI Automation for SMBs"
├─ [x] Research 10 SaaS companies
├─ [ ] Send outreach emails to 3 prospects
└─ [ ] Review analytics

🎯 ACTIVE PROJECTS
├─ Content Creation (In Progress)
│  └─ Blog post ideas: 5 pending
├─ Lead Generation (Just Started)
│  └─ Prospects: 12 researched, 5 warm
└─ Mission Control (In Dev)

⏰ REMINDERS
├─ Tomorrow: Blog post reminder (from briefing)
├─ Friday: Weekly summary due
└─ Sunday: Plan next week

💡 AUGUST'S RECOMMENDATIONS
├─ Focus on content this week
├─ Consider these 3 blog topics (trending)
└─ Follow up with 2 warm prospects

🔧 INTEGRATIONS NEEDED
├─ [ ] Gmail (awaiting setup)
├─ [ ] GitHub (awaiting access)
└─ [ ] Analytics (awaiting platform)
```

### Data Sources

Mission Control pulls from:
- `task-capture/daily/` - Daily tasks
- `briefings/reminders.md` - Upcoming reminders
- `integrations/STATUS.md` - Integration status
- `MEMORY.md` - Projects and context
- Cron job history - What's scheduled
- Blog analytics (when integrated) - Views/engagement

### Tech Stack Options

**Option A: Simple Web App (Easiest)**
- HTML/CSS/JavaScript
- Reads from local JSON files
- Deploy to GitHub Pages or Vercel
- Auto-refresh every 5 min

**Option B: React Dashboard (Better UX)**
- React + Vite
- API to read files
- Real-time updates
- Tailwind CSS for styling

**Option C: Full Web App (Most Powerful)**
- Backend: Node.js/Express
- Frontend: React
- Database: Track more data
- Real-time WebSocket updates

## What I Need to Build This

### Skills/Access Required

1. **GitHub Access**
   - Create repo for Mission Control
   - Push code commits
   - Deploy (GitHub Pages or Vercel)

2. **Web Development Skills**
   - HTML/CSS/JavaScript (already have)
   - React (if doing Option B/C)
   - API development (if Option C)

3. **File System Access**
   - Read JSON task files
   - Parse briefing/reminder data
   - Real-time file monitoring

4. **Deployment Access**
   - GitHub Pages (free, simple)
   - Vercel (free, powerful)
   - Or self-host on your VM

## MVP (Minimum Viable Product)

**Week 1:** Simple version
- Static HTML dashboard
- Shows current tasks + reminders
- Reads from JSON files
- Manual refresh

**Week 2:** Add interactivity
- Real-time updates
- Click to mark tasks done
- Filter/search tasks
- Mobile responsive

**Week 3+:** Advanced features
- Analytics charts
- Project timelines
- Prospect tracking
- August's AI insights widget

## Next Steps

1. Confirm which tech stack you prefer (A/B/C)
2. Create GitHub repo for Mission Control
3. Give me GitHub access
4. I start building on the side while doing daily content work
5. First working version in ~1 week

## Notes

- This app is JUST FOR YOU - shows your private business data
- Should run locally or on a private instance
- Will integrate with all our systems as they grow
- Can add real-time alerts/notifications later