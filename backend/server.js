const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());

const WORKSPACE_PATH = '/home/trader/clawd';

// Helper functions to read task files
function readTaskFile() {
  try {
    const todayPath = `/home/trader/clawd/task-capture/daily/${new Date().toISOString().split('T')[0]}.md`;
    if (fs.existsSync(todayPath)) {
      return fs.readFileSync(todayPath, 'utf-8');
    }
    return '';
  } catch (e) {
    return '';
  }
}

function parseTasksFromMarkdown(content) {
  const lines = content.split('\n');
  const tasks = [];
  let inTaskSection = false;
  let id = 0;

  lines.forEach((line) => {
    if (line.includes('Tasks & Action Items')) {
      inTaskSection = true;
      return;
    }
    if (inTaskSection && line.startsWith('##')) {
      inTaskSection = false;
      return;
    }
    if (inTaskSection && line.match(/^\s*[-•]/)) {
      const completed = line.includes('✅');
      const text = line.replace(/^\s*[-•]\s*/, '').replace(/\s*✅\s*$/, '').trim();
      if (text && !text.startsWith('*')) {
        tasks.push({
          id: ++id,
          text,
          completed,
          dueDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  });

  return tasks;
}

function readReminders() {
  try {
    const content = fs.readFileSync(`${WORKSPACE_PATH}/briefings/reminders.md`, 'utf-8');
    const lines = content.split('\n');
    const reminders = [];
    
    lines.forEach((line) => {
      if (line.match(/^-\s*\*\*/)) {
        const text = line.replace(/^-\s*/, '').trim();
        reminders.push(text);
      }
    });

    return reminders;
  } catch (e) {
    return [];
  }
}

function getStats() {
  return {
    blogPostsThisMonth: 3,
    prospectsInPipeline: 5,
    blogViewsSevenDay: 342,
    nextBriefing: '8:00 AM'
  };
}

// API Routes
app.get('/api/stats', (req, res) => {
  res.json(getStats());
});

app.get('/api/tasks', (req, res) => {
  const content = readTaskFile();
  const tasks = parseTasksFromMarkdown(content);
  res.json(tasks);
});

app.get('/api/reminders', (req, res) => {
  const reminders = readReminders();
  res.json(reminders);
});

app.get('/api/projects', (req, res) => {
  const projects = [
    {
      id: 1,
      name: 'Content Creation',
      status: 'In Progress',
      progress: 60,
      nextAction: 'Write blog post on AI Automation'
    },
    {
      id: 2,
      name: 'Lead Generation',
      status: 'Just Started',
      progress: 20,
      nextAction: 'Research target companies'
    },
    {
      id: 3,
      name: 'Mission Control',
      status: 'In Development',
      progress: 85,
      nextAction: 'Deploy to Vercel'
    }
  ];
  res.json(projects);
});

app.get('/api/integrations', (req, res) => {
  const integrations = [
    { name: 'Brave Search API', status: 'active' },
    { name: 'OpenAI API', status: 'active' },
    { name: 'Gmail', status: 'pending' },
    { name: 'GitHub', status: 'pending' },
    { name: 'Analytics', status: 'pending' }
  ];
  res.json(integrations);
});

app.get('/api/insights', (req, res) => {
  const insights = [
    'Focus on content creation this week',
    'Consider these 3 trending topics for blogs',
    'Follow up with 2 warm prospects'
  ];
  res.json(insights);
});

app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Task text required' });
  }
  
  // In a real app, write to file
  res.json({ id: Date.now(), text, completed: false });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  res.json({ id, completed });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mission Control backend running on port ${PORT}`);
});
