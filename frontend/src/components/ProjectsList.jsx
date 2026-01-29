import React from 'react';

function ProjectsList({ projects }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-6 flex items-center">🎯 Active Projects</h2>
      
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-700 rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{project.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                project.status === 'In Progress' ? 'bg-blue-600' :
                project.status === 'In Development' ? 'bg-purple-600' :
                'bg-green-600'
              }`}>
                {project.status}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-300">
              <span className="text-gray-400">Next:</span> {project.nextAction}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsList;