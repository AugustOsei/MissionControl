#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Get OpenAI API key from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable not set');
  process.exit(1);
}

// Read the spec
const specPath = path.join(__dirname, 'DETAILED_SPEC.md');
const spec = fs.readFileSync(specPath, 'utf-8');

// Create prompts for different parts of the app
const prompts = {
  backend: `You are an expert Node.js developer. Based on this spec, generate a complete Express.js backend for the Mission Control dashboard.

SPEC:
${spec}

Requirements:
- Create server.js with Express setup
- Create routes/api.js with all endpoints
- Create controllers/dashboardController.js to read task files
- Create utils/fileReader.js to read markdown files from /home/trader/clawd/
- Create utils/dataParser.js to parse markdown to JSON
- Include error handling
- Return JSON responses
- Support CORS
- Add file watching for real-time updates

Generate ONLY the code files needed. Format as JSON with filename as key and file contents as value.`,

  frontend: `You are an expert React developer with Tailwind CSS expertise. Based on this spec, generate a complete React + Vite frontend for the Mission Control dashboard.

SPEC:
${spec}

Requirements:
- Create package.json for Vite + React setup
- Create vite.config.js configuration
- Create src/App.jsx main component
- Create all components listed in the spec
- Create src/services/api.js to call backend
- Create src/hooks/useDashboard.js for data fetching
- Use Tailwind CSS for all styling (no separate CSS files)
- Make it mobile responsive
- Include loading states
- Auto-refresh data every 10 seconds
- Handle API calls gracefully

Generate ONLY the code files needed. Format as JSON with filename as key and file contents as value.`,

  packageJson: `Generate a root package.json for a monorepo with:
- Frontend (React + Vite + Tailwind)
- Backend (Node.js + Express)
- Scripts for dev, build, deploy
- All necessary dependencies

Include Vercel deployment configuration.

Return ONLY valid JSON with the complete package.json file.`
};

async function callOpenAI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
            resolve(parsed.choices[0].message.content);
          } else {
            reject(new Error('Invalid OpenAI response: ' + responseData));
          }
        } catch (e) {
          reject(new Error('Failed to parse OpenAI response: ' + e.message));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function generateApp() {
  console.log('🚀 Generating Mission Control app...\n');

  try {
    console.log('📝 Generating backend code...');
    const backendCode = await callOpenAI(prompts.backend);
    fs.writeFileSync(path.join(__dirname, 'GENERATED_BACKEND.json'), backendCode);
    console.log('✅ Backend code generated\n');

    console.log('🎨 Generating frontend code...');
    const frontendCode = await callOpenAI(prompts.frontend);
    fs.writeFileSync(path.join(__dirname, 'GENERATED_FRONTEND.json'), frontendCode);
    console.log('✅ Frontend code generated\n');

    console.log('📦 Generating package.json...');
    const packageJson = await callOpenAI(prompts.packageJson);
    fs.writeFileSync(path.join(__dirname, 'GENERATED_PACKAGE.json'), packageJson);
    console.log('✅ Package.json generated\n');

    console.log('🎉 Code generation complete!');
    console.log('\nGenerated files:');
    console.log('  - GENERATED_BACKEND.json');
    console.log('  - GENERATED_FRONTEND.json');
    console.log('  - GENERATED_PACKAGE.json\n');
    console.log('Next: Review files and structure the project directories');

  } catch (error) {
    console.error('❌ Error generating code:', error.message);
    process.exit(1);
  }
}

generateApp();