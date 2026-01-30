import React from 'react';

function ProjectsList({ projects }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'from-blue-500 to-blue-600';
      case 'In Development': return 'from-purple-500 to-purple-600';
      case 'Just Started': return 'from-orange-500 to-orange-600';
      default: return 'from-green-500 to-green-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-md shadow-xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
        <span className="text-3xl mr-3">🚀</span> Active Projects
      </h2>
      
      <div className="space-y-5">
        {projects.map((project) => (
          <div key={project.id} className="bg-slate-700/30 rounded-xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 shadow-lg hover:shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-white flex-1">{project.name}</h3>
              <span className={`bg-gradient-to-r ${getStatusColor(project.status)} text-xs px-3 py-1 rounded-full font-semibold text-white whitespace-nowrap ml-3`}>
                {project.status}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span className="font-medium">Progress</span>
                <span className="text-blue-400 font-semibold">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600/30">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">→</span>
              <span><span className="text-gray-500">Next:</span> {project.nextAction}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsList;