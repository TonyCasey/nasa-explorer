import React from 'react';

type Status = 'online' | 'offline' | 'warning' | 'error' | 'success';

interface StatusIndicatorProps {
  status: Status;
  label: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  description,
  size = 'medium',
  className = '',
}) => {
  const getStatusConfig = (status: Status) => {
    const configs = {
      online: {
        color: 'bg-aurora-green',
        glowColor: 'shadow-green-400/30',
        icon: '🟢',
        textColor: 'text-aurora-green',
      },
      offline: {
        color: 'bg-gray-500',
        glowColor: 'shadow-gray-400/30',
        icon: '⚫',
        textColor: 'text-gray-400',
      },
      warning: {
        color: 'bg-stellar-yellow',
        glowColor: 'shadow-yellow-400/30',
        icon: '🟡',
        textColor: 'text-stellar-yellow',
      },
      error: {
        color: 'bg-mars-red',
        glowColor: 'shadow-red-400/30',
        icon: '🔴',
        textColor: 'text-mars-red',
      },
      success: {
        color: 'bg-aurora-green',
        glowColor: 'shadow-green-400/30',
        icon: '✅',
        textColor: 'text-aurora-green',
      },
    };
    return configs[status];
  };

  const getSizeClasses = (size: string) => {
    const sizes = {
      small: {
        dot: 'w-2 h-2',
        text: 'text-sm',
        icon: 'text-xs',
      },
      medium: {
        dot: 'w-3 h-3',
        text: 'text-base',
        icon: 'text-sm',
      },
      large: {
        dot: 'w-4 h-4',
        text: 'text-lg',
        icon: 'text-base',
      },
    };
    return sizes[size as keyof typeof sizes];
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <div
          className={`${sizeClasses.dot} ${config.color} rounded-full shadow-lg ${config.glowColor} animate-pulse-slow`}
        />
        <span className={`${sizeClasses.icon}`}>{config.icon}</span>
      </div>

      <div className="flex-1">
        <div className={`font-medium text-white ${sizeClasses.text}`}>
          {label}
        </div>
        {description && (
          <div className="text-gray-400 text-sm mt-1">{description}</div>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;
