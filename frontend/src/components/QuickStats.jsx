import React from 'react';

function QuickStats({ stats }) {
  const statCards = [
    { label: 'Blog Posts (This Month)', value: stats.blogPostsThisMonth || 3, icon: '📝' },
    { label: 'Prospects (Pipeline)', value: stats.prospectsInPipeline || 5, icon: '🎯' },
    { label: 'Blog Views (7-day)', value: stats.blogViewsSevenDay || 342, icon: '👁️' },
    { label: 'Next Briefing', value: stats.nextBriefing || '8:00 AM', icon: '⏰' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-6 flex items-center">📊 Quick Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-gray-700 rounded p-4 text-center">
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold text-blue-400">{card.value}</div>
            <div className="text-xs text-gray-400 mt-2">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickStats;