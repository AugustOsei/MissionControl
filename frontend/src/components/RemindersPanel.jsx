import React from 'react';

function RemindersPanel({ reminders }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center">⏰ Upcoming Reminders</h2>
      
      <div className="space-y-2">
        {reminders.length > 0 ? (
          reminders.slice(0, 5).map((reminder, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-yellow-400 mt-0.5">📌</span>
              <span>{reminder}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No upcoming reminders</p>
        )}
      </div>
    </div>
  );
}

export default RemindersPanel;