#!/bin/bash

# Generate Mission Control app code using OpenAI API

OPENAI_API_KEY="${OPENAI_API_KEY:-}"
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY environment variable not set"
  exit 1
fi

echo "🚀 Generating Mission Control app..."
echo ""

# Read the spec file
SPEC=$(cat /home/trader/clawd/mission-control/DETAILED_SPEC.md)

# Generate Backend
echo "📝 Generating backend code..."
BACKEND_PROMPT="You are an expert Node.js/Express developer. Generate a COMPLETE, PRODUCTION-READY Express.js backend server for a React dashboard app.

Include these files with full working code:
1. server.js - Express server with CORS, routes, error handling
2. routes/api.js - All API routes
3. controllers/dashboardController.js - Business logic
4. utils/fileReader.js - Read markdown files from /home/trader/clawd/
5. package.json - Node dependencies

Return ONLY valid JSON format: {\"filename\": \"path/name.js\", \"content\": \"code here\"}

Make it complete and deployable."

curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [{"role": "user", "content": "'"$(echo "$BACKEND_PROMPT" | sed 's/"/\\"/g')"'"}],
    "temperature": 0.7,
    "max_tokens": 3000
  }' | jq '.choices[0].message.content' > backend-generated.txt

echo "✅ Backend generated (see backend-generated.txt)"
echo ""

# Generate Frontend  
echo "🎨 Generating frontend code..."
FRONTEND_PROMPT="You are an expert React + Tailwind CSS developer. Generate a COMPLETE React dashboard using Vite.

Files needed:
1. src/App.jsx - Main dashboard component
2. src/components/Dashboard.jsx - Layout
3. src/services/api.js - API calls
4. package.json - React + Vite dependencies
5. vite.config.js - Vite config
6. index.html - Entry point

Return ONLY valid JSON format: {\"filename\": \"path/name.jsx\", \"content\": \"code here\"}

Use Tailwind for styling. Make it production-ready."

curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [{"role": "user", "content": "'"$(echo "$FRONTEND_PROMPT" | sed 's/"/\\"/g')"'"}],
    "temperature": 0.7,
    "max_tokens": 3000
  }' | jq '.choices[0].message.content' > frontend-generated.txt

echo "✅ Frontend generated (see frontend-generated.txt)"
echo ""

echo "🎉 Code generation complete!"
echo ""
echo "Generated files:"
echo "  - backend-generated.txt"
echo "  - frontend-generated.txt"
echo ""
echo "Next: Review and structure the project"