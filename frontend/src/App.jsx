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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, tasks, projects, reminders, integrations, insights] = await Promise.all([
          fetch(`${API_URL}/api/stats`).then(r => r.json()),
          fetch(`${API_URL}/api/tasks`).then(r => r.json()),
          fetch(`${API_URL}/api/projects`).then(r => r.json()),
          fetch(`${API_URL}/api/reminders`).then(r => r.json()),
          fetch(`${API_URL}/api/integrations`).then(r => r.json()),
          fetch(`${API_URL}/api/insights`).then(r => r.json())
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl text-white">🚀 Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Dashboard data={data} />
    </div>
  );
}

export default App;