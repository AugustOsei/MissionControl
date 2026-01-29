import React from 'react';
import QuickStats from './QuickStats';
import TaskList from './TaskList';
import ProjectsList from './ProjectsList';
import RemindersPanel from './RemindersPanel';
import InsightsPanel from './InsightsPanel';
import IntegrationStatus from './IntegrationStatus';

function Dashboard({ data }) {
  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">🎯 Mission Control</h1>
        <p className="text-gray-400">August Wheel Operations Dashboard</p>
        <p className="text-sm text-gray-500 mt-2">{now}</p>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={data.stats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column - Tasks & Projects */}
        <div className="lg:col-span-2 space-y-8">
          <TaskList tasks={data.tasks} />
          <ProjectsList projects={data.projects} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          <RemindersPanel reminders={data.reminders} />
          <InsightsPanel insights={data.insights} />
          <IntegrationStatus integrations={data.integrations} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-700">
        <p className="text-gray-500 text-sm">
          Last updated: {new Date().toLocaleTimeString()} | Next briefing: 8:00 AM
        </p>
      </div>
    </div>
  );
}

export default Dashboard;