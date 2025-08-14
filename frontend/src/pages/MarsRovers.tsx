import React from 'react';
import logger from '../utils/logger';

const MarsRovers: React.FC = () => {
  React.useEffect(() => {
    logger.info('Mars Rovers page loaded');
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-inter font-bold text-white mb-8 text-gradient">
          Mars Rover Gallery
        </h1>

        <div className="glass-effect rounded-xl p-6">
          <p className="text-gray-300 text-lg">
            Discover the Red Planet through the eyes of NASA's Mars rovers:
            Curiosity, Opportunity, Spirit, and Perseverance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarsRovers;
