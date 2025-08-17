import React from 'react';

interface NEOData {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_second: string;
    };
    miss_distance: {
      kilometers: string;
      lunar: string;
    };
  }>;
}

interface NEOCardProps {
  neo: NEOData;
  className?: string;
  onClick?: () => void;
}

const NEOCard: React.FC<NEOCardProps> = ({ neo, className = '', onClick }) => {
  const approachData = neo.close_approach_data[0];
  const diameter = neo.estimated_diameter.kilometers;
  const avgDiameter =
    (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2;
  const velocity = parseFloat(
    approachData.relative_velocity.kilometers_per_second
  );
  const missDistance = parseFloat(approachData.miss_distance.lunar);

  const getRiskLevel = () => {
    if (neo.is_potentially_hazardous_asteroid) {
      return {
        level: 'high',
        color: 'mars-red',
        emoji: '🔴',
        label: 'High Risk',
      };
    } else if (missDistance < 10) {
      return {
        level: 'medium',
        color: 'stellar-yellow',
        emoji: '🟡',
        label: 'Medium Risk',
      };
    } else {
      return {
        level: 'low',
        color: 'aurora-green',
        emoji: '🟢',
        label: 'Low Risk',
      };
    }
  };

  const getSizeCategory = () => {
    if (avgDiameter > 1) {
      return {
        category: 'Large',
        emoji: '🌑',
        description: 'Over 1 km diameter',
      };
    } else if (avgDiameter > 0.14) {
      return {
        category: 'Medium',
        emoji: '🪨',
        description: '140m - 1km diameter',
      };
    } else {
      return {
        category: 'Small',
        emoji: '🥎',
        description: 'Under 140m diameter',
      };
    }
  };

  const risk = getRiskLevel();
  const size = getSizeCategory();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`
        glass-effect rounded-xl p-6 transition-all duration-300 
        ${onClick ? 'cursor-pointer hover:scale-105 card-hover' : ''}
        border-l-4 border-${risk.color}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-inter font-bold text-lg leading-tight">
            {neo.name.replace(/[()]/g, '')}
          </h3>
          <p className="text-gray-300 text-sm mt-1 font-medium">ID: {neo.id}</p>
        </div>
        <div className={`text-${risk.color} text-2xl`}>{risk.emoji}</div>
      </div>

      {/* Risk Assessment */}
      <div
        className={`bg-${risk.color}/10 border border-${risk.color}/30 rounded-lg p-3 mb-4`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-${risk.color} font-medium text-sm`}>
            Risk Level: {risk.label}
          </span>
          {neo.is_potentially_hazardous_asteroid && (
            <span className="bg-mars-red/20 text-mars-red text-xs px-2 py-1 rounded-full">
              ⚠️ PHA
            </span>
          )}
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="text-gray-300 text-xs font-medium">Size Category</div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{size.emoji}</span>
            <div>
              <div className="text-white font-semibold text-sm">
                {size.category}
              </div>
              <div className="text-gray-300 text-xs">{size.description}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-gray-300 text-xs font-medium">Approach Date</div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📅</span>
            <div>
              <div className="text-white font-semibold text-sm">
                {formatDate(approachData.close_approach_date)}
              </div>
              <div className="text-gray-300 text-xs">Closest approach</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm font-medium">Diameter:</span>
          <span className="text-white font-semibold text-sm">
            {avgDiameter.toFixed(2)} km
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm font-medium">Velocity:</span>
          <span className="text-white font-semibold text-sm">
            {velocity.toFixed(1)} km/s
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm font-medium">
            Miss Distance:
          </span>
          <span className="text-white font-semibold text-sm">
            {missDistance.toFixed(2)} LD
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm font-medium">Magnitude:</span>
          <span className="text-white font-semibold text-sm">
            {neo.absolute_magnitude_h.toFixed(1)} H
          </span>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-gray-300 text-xs">
          LD = Lunar Distance (384,400 km) • PHA = Potentially Hazardous
          Asteroid
        </p>
      </div>
    </div>
  );
};

export default NEOCard;
