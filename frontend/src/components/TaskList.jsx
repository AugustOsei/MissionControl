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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-6 flex items-center">📋 This Week's Tasks</h2>
      
      <div className="space-y-3 mb-6">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition">
              <input
                type="checkbox"
                defaultChecked={task.completed}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <span className={`ml-3 flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                {task.text}
              </span>
              <span className="text-xs text-gray-400">{task.dueDate}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No tasks yet. Add one to get started!</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 font-medium transition"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default TaskList;