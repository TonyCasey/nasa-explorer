import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';

interface DataWidgetProps {
  title: string;
  icon?: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string;
  className?: string;
  onClick?: () => void;
  onRefresh?: () => void;
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
  onRefresh,
}) => {
  const baseClasses = `glass-effect rounded-xl p-6 transition-all duration-300 ${
    onClick ? 'cursor-pointer hover:scale-105 card-hover' : ''
  } ${className}`;

  return (
    <div className={baseClasses} onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <span className="text-2xl" role="img" aria-label={title}>
              {icon}
            </span>
          )}
          <div>
            <h3 className="text-xl font-inter font-semibold text-white">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Refresh"
          >
            🔄
          </button>
        )}
      </div>

      <div className="relative min-h-[120px]">
        {isLoading ? (
          <LoadingSkeleton data-testid="loading-skeleton" />
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-mars-red text-sm mb-2">
                ⚠️ Error loading data
              </p>
              <p className="text-gray-400 text-xs">{error}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh?.();
                }}
                className="mt-2 px-3 py-1 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white text-xs rounded transition-colors duration-200"
              >
                Retry
              </button>
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
