import React, { useState } from 'react';

function Kanban({ tasks }) {
  const [newTask, setNewTask] = useState('');
  const [localTasks, setLocalTasks] = useState(tasks);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTask })
      });
      
      if (response.ok) {
        const newTaskData = await response.json();
        setLocalTasks([...localTasks, { ...newTaskData, status: 'todo', dueDate: new Date().toISOString().split('T')[0] }]);
        setNewTask('');
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setLocalTasks(localTasks.map(t => 
      t.id == taskId ? { ...t, status } : t
    ));
  };

  const columns = {
    todo: { title: 'To Do', color: 'bg-slate-100', icon: '📝' },
    progress: { title: 'In Progress', color: 'bg-blue-50', icon: '⚡' },
    done: { title: 'Done', color: 'bg-green-50', icon: '✅' }
  };

  return (
    <div>
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(columns).map(([status, { title, icon }]) => {
          const statusTasks = localTasks.filter(t => (t.status || (t.completed ? 'done' : 'todo')) === status);
          
          return (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="bg-slate-900 rounded-xl p-5 min-h-96 border border-slate-800"
            >
              <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                {title}
                <span className="ml-auto text-sm font-normal text-slate-400">{statusTasks.length}</span>
              </h3>
              
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-move hover:border-slate-600 hover:bg-slate-750 transition text-sm text-slate-200"
                  >
                    {task.text}
                  </div>
                ))}
                {statusTasks.length === 0 && (
                  <div className="text-slate-500 text-sm text-center py-8">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Kanban;
