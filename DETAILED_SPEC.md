# Mission Control - Detailed Technical Spec (MVP)

## Project Overview
A real-time dashboard for August Wheel business operations. Shows tasks, reminders, projects, and August's intelligence/recommendations at a glance.

## Tech Stack
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** JSON files (local)
- **Deployment:** Vercel

## Core Features (MVP)

### 1. Dashboard Layout

**Header:**
- Title: "Mission Control - August Wheel"
- Current date/time (auto-updating)
- Quick stats row

**Main Content Areas:**

#### Quick Stats (Top)
```
📊 QUICK STATS
├─ Blog Posts (This Month): [count]
├─ Prospects (Pipeline): [count]  
├─ Blog Views (7-day): [count]
└─ Next Briefing: [time]
```

#### This Week's Tasks
```
📋 THIS WEEK'S TASKS
├─ [ ] Task 1 (with completion checkbox)
├─ [x] Task 2 (completed)
└─ [ ] Task 3
+ Add new task button
```

#### Active Projects
```
🎯 ACTIVE PROJECTS
├─ Content Creation (In Progress)
│  ├─ Status: 60% complete
│  └─ Next: [next action]
├─ Lead Generation (Just Started)
│  ├─ Status: 20% complete
│  └─ Next: [next action]
└─ Mission Control (In Dev)
   ├─ Status: Development
   └─ Next: MVP complete
```

#### Upcoming Reminders
```
⏰ UPCOMING REMINDERS
├─ Tomorrow 8 AM: Morning briefing
├─ Friday: Weekly summary
└─ Sunday: Plan next week
```

#### August's Recommendations
```
💡 AUGUST'S INSIGHTS
├─ "Focus on content this week"
├─ "Consider these 3 trending topics for blogs"
└─ "Follow up with 2 warm prospects"
```

#### Integration Status
```
🔧 INTEGRATIONS
├─ ✅ Brave Search API
├─ ✅ OpenAI API
├─ ⏳ Gmail (pending setup)
├─ ⏳ GitHub (pending access)
└─ ⏳ Analytics (pending platform)
```

### 2. Data Sources

**Backend reads from:**
- `/home/trader/clawd/task-capture/daily/*.md` (daily tasks)
- `/home/trader/clawd/briefings/reminders.md` (reminders)
- `/home/trader/clawd/MEMORY.md` (projects + context)
- `/home/trader/clawd/integrations/STATUS.md` (integration status)
- Hard-coded insights/recommendations (for MVP)

### 3. API Endpoints

**Backend (Node/Express):**
```
GET  /api/stats          → Quick stats data
GET  /api/tasks          → This week's tasks
GET  /api/projects       → Active projects
GET  /api/reminders      → Upcoming reminders
GET  /api/integrations   → Integration status
POST /api/tasks          → Add new task
PUT  /api/tasks/:id      → Update task
GET  /api/insights       → August's recommendations
```

### 4. Frontend Components

**React Components:**
- `<Dashboard>` - Main layout container
- `<QuickStats>` - Stats cards
- `<TaskList>` - Task management
- `<ProjectsList>` - Active projects
- `<RemindersPanel>` - Upcoming reminders
- `<InsightsPanel>` - Recommendations
- `<IntegrationStatus>` - Integration status
- `<TaskForm>` - Add/edit task modal

### 5. Styling
- **CSS Framework:** Tailwind CSS
- **Color Scheme:** 
  - Primary: Blue/Purple (professional)
  - Accent: Green (success/active)
  - Warning: Orange (pending/upcoming)
- **Typography:** Clean, readable fonts
- **Responsive:** Mobile-first design

### 6. Functionality (MVP)

**Read-Only (MVP):**
- ✅ Display all data dynamically
- ✅ Auto-refresh every 5-10 seconds
- ✅ Show real-time updates from files

**Interactive (MVP):**
- ✅ Click tasks to mark complete/incomplete
- ✅ Add new tasks via form
- ✅ Delete tasks
- ✅ Minimal styling/cosmetic changes

**NOT in MVP (Phase 2):**
- ❌ Task editing/updating
- ❌ Project CRUD
- ❌ Reminder management
- ❌ Analytics charts
- ❌ User authentication

### 7. Deployment

**Vercel:**
- Frontend: Auto-deploys from GitHub
- Backend: Node.js serverless functions
- Environment variables: File paths, API keys
- Domain: `mission-control-august.vercel.app` (example)

### 8. File Structure

```
mission-control/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── QuickStats.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── ProjectsList.jsx
│   │   │   ├── RemindersPanel.jsx
│   │   │   ├── InsightsPanel.jsx
│   │   │   ├── IntegrationStatus.jsx
│   │   │   └── TaskForm.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── hooks/
│   │   │   └── useDashboard.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── index.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── api.js
│   ├── controllers/
│   │   └── dashboardController.js
│   ├── utils/
│   │   ├── fileReader.js
│   │   └── dataParser.js
│   ├── package.json
│   └── .env.example
├── .github/
│   └── workflows/
│       └── deploy.yml
├── README.md
├── DEPLOYMENT.md
└── package.json (root)
```

### 9. Environment Variables

```
VITE_API_URL=http://localhost:3001
NODE_ENV=development
WORKSPACE_PATH=/home/trader/clawd
```

### 10. Success Criteria (MVP)

✅ Dashboard loads and displays data from files
✅ Real-time updates every 5-10 seconds
✅ Tasks can be added/completed
✅ Mobile responsive
✅ Deploy to Vercel successfully
✅ Accessible from any device on internet
✅ Shows all key business information at a glance

---

## Build Order

1. Backend setup (Express server + routes)
2. Frontend setup (React + Vite)
3. Data fetching (read task files)
4. Components (display data)
5. Interactivity (add/complete tasks)
6. Styling (Tailwind)
7. Deployment (Vercel)

---

## Notes for Code Generation

- Use modern React patterns (hooks, functional components)
- Make it fast and responsive
- Clean, readable code structure
- Include error handling
- Add loading states
- Use Tailwind for all styling (no CSS files)
- Keep it simple for MVP (avoid complexity)