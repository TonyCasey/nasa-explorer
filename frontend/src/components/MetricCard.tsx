import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: string;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'yellow';
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  icon,
  color = 'blue',
  className = '',
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'from-space-blue/20 to-cosmic-purple/20',
        text: 'text-space-blue',
        border: 'border-space-blue/30',
        glow: 'shadow-blue-400/20',
      },
      purple: {
        bg: 'from-cosmic-purple/20 to-space-blue/20',
        text: 'text-cosmic-purple',
        border: 'border-cosmic-purple/30',
        glow: 'shadow-purple-400/20',
      },
      green: {
        bg: 'from-aurora-green/20 to-space-blue/20',
        text: 'text-aurora-green',
        border: 'border-aurora-green/30',
        glow: 'shadow-green-400/20',
      },
      orange: {
        bg: 'from-solar-orange/20 to-cosmic-purple/20',
        text: 'text-solar-orange',
        border: 'border-solar-orange/30',
        glow: 'shadow-orange-400/20',
      },
      red: {
        bg: 'from-mars-red/20 to-space-blue/20',
        text: 'text-mars-red',
        border: 'border-mars-red/30',
        glow: 'shadow-red-400/20',
      },
      yellow: {
        bg: 'from-stellar-yellow/20 to-cosmic-purple/20',
        text: 'text-stellar-yellow',
        border: 'border-stellar-yellow/30',
        glow: 'shadow-yellow-400/20',
      },
    };
    return colors[color as keyof typeof colors];
  };

  const colorClasses = getColorClasses(color);

  return (
    <div
      className={`
        bg-gradient-to-br ${colorClasses.bg}
        border ${colorClasses.border}
        rounded-xl p-6 backdrop-blur-sm
        hover:shadow-lg ${colorClasses.glow}
        transition-all duration-300
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl" role="img" aria-label={title}>
          {icon}
        </span>
        {trend && (
          <div
            className={`flex items-center space-x-1 text-sm ${
              trend.isPositive ? 'text-aurora-green' : 'text-mars-red'
            }`}
          >
            <span>{trend.isPositive ? '↗️' : '↘️'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex items-end space-x-2">
          <span
            className={`text-3xl font-inter font-bold ${colorClasses.text}`}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-gray-400 text-sm pb-1">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
