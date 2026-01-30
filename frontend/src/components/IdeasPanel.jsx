import React from 'react';

function IdeasPanel({ insights }) {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-5">
      <h2 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <span className="text-lg">💡</span> Ideas
      </h2>
      
      <div className="space-y-2">
        {insights.length > 0 ? (
          insights.slice(0, 6).map((idea, idx) => (
            <div key={idx} className="text-sm text-slate-300 p-2 hover:bg-slate-800 rounded transition">
              • {idea}
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">No ideas yet</p>
        )}
      </div>
    </div>
  );
}

export default IdeasPanel;
