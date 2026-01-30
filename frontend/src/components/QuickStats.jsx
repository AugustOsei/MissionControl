import React from 'react';

function QuickStats({ stats }) {
  const statCards = [
    { label: 'Blog Posts (This Month)', value: stats.blogPostsThisMonth || 3, icon: '📝', color: 'from-blue-500 to-cyan-500' },
    { label: 'Prospects (Pipeline)', value: stats.prospectsInPipeline || 5, icon: '🎯', color: 'from-purple-500 to-pink-500' },
    { label: 'Blog Views (7-day)', value: stats.blogViewsSevenDay || 342, icon: '👁️', color: 'from-orange-500 to-red-500' },
    { label: 'Next Briefing', value: stats.nextBriefing || '8:00 AM', icon: '⏰', color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card, idx) => (
        <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 backdrop-blur-sm group cursor-pointer`}>
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
          <div className="text-3xl font-bold text-white drop-shadow-lg">{card.value}</div>
          <div className="text-sm text-white/80 mt-2 font-medium">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

export default QuickStats;