import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ImageViewerProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt,
  title,
  description,
  className = '',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeFullscreen = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <div className={`relative rounded-xl overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-space-dark/50 backdrop-blur-sm z-10">
            <LoadingSpinner size="md" />
          </div>
        )}

        {hasError ? (
          <div className="aspect-video bg-space-dark/50 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🚫</span>
              <p className="text-gray-300 text-sm">Failed to load image</p>
            </div>
          </div>
        ) : (
          <div className="group cursor-pointer" onClick={toggleFullscreen}>
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={handleLoad}
              onError={handleError}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-black/70 rounded-full p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
            {description && (
              <p className="text-gray-300 text-sm line-clamp-2">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <div className="max-w-7xl max-h-full relative">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <h2 className="text-white font-bold text-2xl mb-2">{title}</h2>
                {description && (
                  <p className="text-gray-300 text-base leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageViewer;
