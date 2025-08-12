import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-inter font-bold text-white mb-8 text-gradient">
          Space Mission Control Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-effect rounded-xl p-6 card-hover">
            <h2 className="text-xl font-semibold text-white mb-4">
              Today's Space Image
            </h2>
            <p className="text-gray-300">
              Discover the astronomy picture of the day
            </p>
          </div>

          <div className="glass-effect rounded-xl p-6 card-hover">
            <h2 className="text-xl font-semibold text-white mb-4">
              Mars Rover Gallery
            </h2>
            <p className="text-gray-300">Explore the latest photos from Mars</p>
          </div>

          <div className="glass-effect rounded-xl p-6 card-hover">
            <h2 className="text-xl font-semibold text-white mb-4">
              Near Earth Objects
            </h2>
            <p className="text-gray-300">Track asteroids approaching Earth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
