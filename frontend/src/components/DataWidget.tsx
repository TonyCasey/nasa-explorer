import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface DataWidgetProps {
  title: string;
  icon: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string;
  className?: string;
  onClick?: () => void;
}

const DataWidget: React.FC<DataWidgetProps> = ({
  title,
  icon,
  description,
  children,
  isLoading = false,
  error,
  className = '',
  onClick,
}) => {
  const baseClasses = `glass-effect rounded-xl p-6 transition-all duration-300 ${
    onClick ? 'cursor-pointer hover:scale-105 card-hover' : ''
  } ${className}`;

  return (
    <div className={baseClasses} onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl" role="img" aria-label={title}>
            {icon}
          </span>
          <div>
            <h3 className="text-xl font-inter font-semibold text-white">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="relative min-h-[120px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="sm" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-mars-red text-sm mb-2">
                ⚠️ Error loading data
              </p>
              <p className="text-gray-400 text-xs">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </div>
    </div>
  );
};

export default DataWidget;
