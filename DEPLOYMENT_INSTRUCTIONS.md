# Mission Control - Deployment Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `mission-control`
3. Description: "Mission Control - August Wheel Dashboard"
4. Make it **Public** (or Private, your choice)
5. Click "Create repository"

## Step 2: Push Code to GitHub

In the terminal, from `/home/trader/clawd/mission-control/`:

```bash
# Add the remote (replace YOUR_USERNAME with AugustOsei)
git remote add origin https://github.com/AugustOsei/mission-control.git

# Rename branch to main (optional but recommended)
git branch -M main

# Push code to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Connect GitHub to Vercel (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `mission-control` repository
4. Configure:
   - **Root Directory**: Leave blank (or select `frontend` for frontend-only)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
   - **Environment Variables**: 
     - `VITE_API_URL`: Will set after backend deploys
5. Click "Deploy"
6. Wait for frontend to deploy ✅

### Option B: Deploy Backend (Simple - No Backend Yet)

For MVP, backend can run locally. Later:

1. Create `backend/` folder on Railway/Fly.io
2. Set `VITE_API_URL` to your backend API URL
3. Redeploy frontend

## Step 4: Test the App

1. Open your Vercel deployment URL
2. Should see Mission Control dashboard
3. Data should load from your local backend (if running)

## Local Development

Run locally first to test:

```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend
npm run frontend:dev

# Open http://localhost:5173
```

## Environment Variables (Vercel)

Set in Vercel project settings:

```
VITE_API_URL=https://your-backend-api.com
NODE_ENV=production
```

## Troubleshooting

- **Port already in use**: Change port in backend/server.js
- **CORS errors**: Check backend CORS configuration
- **API not connecting**: Check VITE_API_URL environment variable
- **Tailwind not loading**: Run `npm run frontend:build` locally first

## Next Steps

1. ✅ Deploy frontend to Vercel
2. 🔄 Deploy backend to Railway/Fly.io (optional for MVP)
3. 📝 Update VITE_API_URL environment variable
4. 🎉 Share dashboard URL

---

Let August know when you've pushed to GitHub and deployed to Vercel!