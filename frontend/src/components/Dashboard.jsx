import React from 'react';
import Kanban from './Kanban';
import RemindersPanel from './RemindersPanel';
import IdeasPanel from './IdeasPanel';

function Dashboard({ data }) {
  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                ⚙️ Mission Control
              </h1>
              <p className="text-sm text-slate-400">{now}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left - Kanban Board */}
          <div className="lg:col-span-3">
            <Kanban tasks={data.tasks} />
          </div>

          {/* Right Sidebar - Reminders & Ideas */}
          <div className="space-y-6">
            <RemindersPanel reminders={data.reminders} />
            <IdeasPanel insights={data.insights} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-800">
          <p className="text-slate-500 text-xs">
            Last updated: {new Date().toLocaleTimeString()} — Next briefing: 8:00 AM UTC
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;