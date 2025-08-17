import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'image' | 'text' | 'list';
  count?: number;
  className?: string;
  'data-testid'?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
  className = '',
  'data-testid': testId,
}) => {
  const renderSkeletonItem = (index: number) => {
    switch (type) {
      case 'card':
        return (
          <div
            key={index}
            className={`glass-effect rounded-xl p-6 animate-pulse ${className}`}
            data-testid={testId}
          >
            <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-white/10 rounded w-5/6"></div>
              <div className="h-3 bg-white/10 rounded w-4/6"></div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div
            key={index}
            className={`bg-white/10 rounded-lg animate-pulse ${className}`}
          >
            <div className="aspect-video w-full bg-gradient-to-br from-white/20 to-white/5 rounded-lg flex items-center justify-center">
              <div className="text-white/40 text-6xl">🌌</div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={index} className={`space-y-2 animate-pulse ${className}`}>
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/15 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        );

      case 'list':
        return (
          <div
            key={index}
            className={`flex items-center space-x-4 animate-pulse ${className}`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/20 rounded w-full"></div>
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => renderSkeletonItem(index))}
    </>
  );
};

export default LoadingSkeleton;
