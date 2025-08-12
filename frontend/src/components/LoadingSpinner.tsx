import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-space-dark/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`relative ${sizeClasses[size]} mx-auto mb-4`}>
          <div className="absolute inset-0 border-4 border-cosmic-purple/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-cosmic-purple rounded-full animate-spin"></div>
          <div
            className="absolute inset-2 border-2 border-transparent border-t-solar-orange rounded-full animate-spin animate-reverse"
            style={{ animationDuration: '0.8s' }}
          ></div>
        </div>

        {message && (
          <p className="text-white font-medium animate-pulse">{message}</p>
        )}

        <div className="flex justify-center space-x-1 mt-2">
          <div
            className="w-2 h-2 bg-cosmic-purple rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-solar-orange rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-aurora-green rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
