import React from 'react';

function IntegrationStatus({ integrations }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-green-400 bg-green-900 bg-opacity-30';
      case 'pending': return 'text-yellow-400 bg-yellow-900 bg-opacity-30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return '✅';
      case 'pending': return '⏳';
      default: return '⚙️';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center">🔧 Integrations</h2>
      
      <div className="space-y-2">
        {integrations.map((integration, idx) => (
          <div key={idx} className={`flex items-center justify-between p-2 rounded text-sm ${getStatusColor(integration.status)}`}>
            <span>{integration.name}</span>
            <span>{getStatusIcon(integration.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IntegrationStatus;