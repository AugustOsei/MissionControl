import React from 'react';

function InsightsPanel({ insights }) {
  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-700/30 backdrop-blur-md shadow-lg">
      <h2 className="text-lg font-bold mb-5 flex items-center text-white">
        <span className="text-2xl mr-2">💡</span> Insights
      </h2>
      
      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-purple-700/20 rounded-lg border border-purple-700/20 hover:border-purple-600/40 transition-all">
              <span className="text-lg mt-0.5 flex-shrink-0">✨</span>
              <p className="text-sm text-gray-100">{insight}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">Awaiting insights...</p>
        )}
      </div>
    </div>
  );
}

export default InsightsPanel;