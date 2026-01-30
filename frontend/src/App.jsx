import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [data, setData] = useState({
    stats: {},
    tasks: [],
    projects: [],
    reminders: [],
    integrations: [],
    insights: []
  });
  const [loading, setLoading] = useState(true);

  // Use relative /api path - Vite proxy will handle routing to backend
  const API_URL = '/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, tasks, projects, reminders, integrations, insights] = await Promise.all([
          fetch(`${API_URL}/stats`).then(r => r.json()),
          fetch(`${API_URL}/tasks`).then(r => r.json()),
          fetch(`${API_URL}/projects`).then(r => r.json()),
          fetch(`${API_URL}/reminders`).then(r => r.json()),
          fetch(`${API_URL}/integrations`).then(r => r.json()),
          fetch(`${API_URL}/insights`).then(r => r.json())
        ]);

        setData({ stats, tasks, projects, reminders, integrations, insights });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-2xl text-slate-100">🚀 Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Dashboard data={data} />
    </div>
  );
}

export default App;