import React from 'react';

function IntegrationStatus({ integrations }) {
  const getStatusStyles = (status) => {
    switch(status) {
      case 'active': 
        return { 
          bg: 'bg-green-700/20', 
          border: 'border-green-600/40', 
          badge: 'bg-green-500/30 text-green-300',
          icon: '✅'
        };
      case 'pending': 
        return { 
          bg: 'bg-yellow-700/20', 
          border: 'border-yellow-600/40',
          badge: 'bg-yellow-500/30 text-yellow-300',
          icon: '⏳'
        };
      default: 
        return { 
          bg: 'bg-gray-700/20', 
          border: 'border-gray-600/40',
          badge: 'bg-gray-500/30 text-gray-300',
          icon: '⚙️'
        };
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-700/30 backdrop-blur-md shadow-lg">
      <h2 className="text-lg font-bold mb-5 flex items-center text-white">
        <span className="text-2xl mr-2">🔗</span> Integrations
      </h2>
      
      <div className="space-y-3">
        {integrations.map((integration, idx) => {
          const styles = getStatusStyles(integration.status);
          return (
            <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${styles.bg} border ${styles.border} hover:border-opacity-100 transition-all`}>
              <span className="text-sm font-medium text-gray-100">{integration.name}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${styles.badge}`}>
                {styles.icon}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IntegrationStatus;