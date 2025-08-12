import React from 'react';

const APOD: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-inter font-bold text-white mb-8 text-gradient">
          Astronomy Picture of the Day
        </h1>

        <div className="glass-effect rounded-xl p-6">
          <p className="text-gray-300 text-lg">
            Explore stunning space imagery and learn about the cosmos through
            NASA's daily featured photographs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APOD;
