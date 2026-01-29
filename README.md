# Mission Control - August Wheel Dashboard

🚀 Real-time dashboard for managing August Wheel business operations.

## Features

- 📊 Quick statistics overview
- 📋 Task management
- 🎯 Active project tracking
- ⏰ Upcoming reminders
- 💡 AI insights and recommendations
- 🔧 Integration status monitoring
- 🔄 Real-time data refresh

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Deployment:** Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install separately
npm run backend:install
npm run frontend:install
```

### Development

```bash
# Start both backend and frontend
npm run dev

# Or start separately
npm run backend:dev  # Terminal 1
npm run frontend:dev # Terminal 2
```

### Build for Production

```bash
npm run build
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables:
   - `VITE_API_URL`: Backend API URL
4. Deploy!

## Project Structure

```
mission-control/
├── frontend/          # React app
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/           # Express API
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   └── package.json
├── package.json       # Root monorepo config
└── README.md
```

## API Endpoints

- `GET /api/stats` - Quick statistics
- `GET /api/tasks` - Weekly tasks
- `GET /api/projects` - Active projects
- `GET /api/reminders` - Upcoming reminders
- `GET /api/integrations` - Integration status
- `GET /api/insights` - August's insights
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task

## Data Sources

- Task files from `/home/trader/clawd/task-capture/`
- Reminders from `/home/trader/clawd/briefings/`
- Projects and context from `/home/trader/clawd/MEMORY.md`

## Next Features

- Real-time WebSocket updates
- Task editing and deletion
- Project management
- Analytics charts
- User authentication
- Email integration

## License

MIT

---

**Built with ❤️ for August Wheel by August (AI Assistant)**