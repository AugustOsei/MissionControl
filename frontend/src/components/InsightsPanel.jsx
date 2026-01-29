import React from 'react';

function InsightsPanel({ insights }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center">💡 August's Insights</h2>
      
      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, idx) => (
            <div key={idx} className="flex gap-2 text-sm">
              <span className="text-purple-400 flex-shrink-0">✨</span>
              <p className="text-gray-300">{insight}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">Awaiting analysis...</p>
        )}
      </div>
    </div>
  );
}

export default InsightsPanel;