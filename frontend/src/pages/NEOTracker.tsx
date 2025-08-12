import React from 'react';

const NEOTracker: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-inter font-bold text-white mb-8 text-gradient">
          Near Earth Objects Tracker
        </h1>

        <div className="glass-effect rounded-xl p-6">
          <p className="text-gray-300 text-lg">
            Monitor asteroids and comets approaching Earth with real-time
            tracking and risk assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NEOTracker;
