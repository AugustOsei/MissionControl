import React, { useState } from 'react';

function TaskList({ tasks }) {
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      console.log('Task added:', newTask);
      setNewTask('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-md shadow-xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
        <span className="text-3xl mr-3">📋</span> This Week's Tasks
      </h2>
      
      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-slate-700/30 group">
              <input
                type="checkbox"
                defaultChecked={task.completed}
                className="w-5 h-5 rounded cursor-pointer accent-blue-500 group-hover:accent-blue-400"
              />
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-100 font-medium'}`}>
                {task.text}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">{task.dueDate}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No tasks yet. Add one to get started!</p>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-700/30">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-slate-700/40 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <button
          onClick={handleAddTask}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg px-6 py-2 font-medium transition-all shadow-lg hover:shadow-xl text-white"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default TaskList;