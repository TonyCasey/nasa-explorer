import React from 'react';
import { getVersionString, getBuildInfo } from '../utils/version';

interface VersionFooterProps {
  className?: string;
  minimal?: boolean;
}

const VersionFooter: React.FC<VersionFooterProps> = ({
  className = '',
  minimal = false,
}) => {
  if (minimal) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        {getVersionString()}
      </div>
    );
  }

  return (
    <footer className={`glass-effect border-t border-white/10 p-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span className="text-gradient font-medium">NASA Space Explorer</span>
          <span>{getVersionString()}</span>
        </div>
        
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <span>{getBuildInfo()}</span>
          <span className="text-cosmic-purple">
            🚀 Built with passion for space exploration
          </span>
        </div>
      </div>
    </footer>
  );
};

export default VersionFooter;