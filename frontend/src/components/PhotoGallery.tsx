import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import LoadingSpinner from './LoadingSpinner';
import FavoriteButton from './FavoriteButton';

interface Photo {
  id: number;
  img_src: string;
  earth_date: string;
  camera: {
    name: string;
    full_name: string;
  };
  rover: {
    name: string;
    status: string;
  };
  sol: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  isLoading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  isLoading = false,
  error = null,
  onLoadMore,
  hasMore = false,
  className = '',
}) => {
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(
    new Set()
  );

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Trigger load more when scrolling into view
  useEffect(() => {
    if (inView && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  const handleImageError = (photoId: number) => {
    setImageLoadErrors((prev) => new Set(Array.from(prev).concat(photoId)));
  };

  const openImageModal = (photo: Photo) => {
    setSelectedImage(photo);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;

    const currentIndex = photos.findIndex((p) => p.id === selectedImage.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0) newIndex = photos.length - 1;
    if (newIndex >= photos.length) newIndex = 0;

    setSelectedImage(photos[newIndex]);
  };

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="glass-effect rounded-xl p-8">
          <span className="text-6xl mb-4 block">🚫</span>
          <h3 className="text-xl font-semibold text-mars-red mb-2">
            Failed to Load Photos
          </h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="glass-effect rounded-xl overflow-hidden group cursor-pointer card-hover"
            onClick={() => openImageModal(photo)}
          >
            <div className="aspect-square relative overflow-hidden">
              {imageLoadErrors.has(photo.id) ? (
                <div className="w-full h-full bg-space-dark/50 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">📷</span>
                    <p className="text-gray-300 text-sm">Image unavailable</p>
                  </div>
                </div>
              ) : (
                <img
                  src={photo.img_src}
                  alt={`Mars surface captured by ${photo.rover.name} rover`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={() => handleImageError(photo.id)}
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-4 right-4">
                  <FavoriteButton
                    item={{
                      id: `mars-photo-${photo.id}`,
                      type: 'mars-photo',
                      title: `${photo.rover.name} - Sol ${photo.sol}`,
                      thumbnail: photo.img_src,
                      data: photo,
                    }}
                    className="text-white hover:text-solar-orange"
                    size="md"
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-semibold text-sm mb-1">
                    Sol {photo.sol} • {photo.camera.name}
                  </h4>
                  <p className="text-gray-300 text-xs">
                    {new Date(photo.earth_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cosmic-purple font-medium text-sm leading-tight break-words flex-shrink min-w-0">
                  🔴 {photo.rover.name}
                </span>
                <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                  Sol {photo.sol}
                </span>
              </div>
              <div className="text-gray-300 text-sm">
                <div className="flex justify-between items-center">
                  <span>{photo.camera.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(photo.earth_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Placeholder Cards */}
        {isLoading &&
          Array.from({ length: 8 }, (_, i) => (
            <div
              key={`loading-${i}`}
              className="glass-effect rounded-xl overflow-hidden"
            >
              <div className="aspect-square bg-space-dark/50 flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="text-center mt-8 py-8">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <LoadingSpinner size="md" />
              <p className="text-gray-400 text-sm">Loading more photos...</p>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              <p>Scroll down to load more</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && photos.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="glass-effect rounded-xl p-8">
            <span className="text-6xl mb-4 block">📷</span>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Photos Found
            </h3>
            <p className="text-gray-400 mb-4">
              No photos are available for the selected filters. This could be
              because:
            </p>
            <div className="text-left max-w-md mx-auto space-y-2 mb-6">
              <div className="flex items-start space-x-2 text-sm text-gray-400">
                <span>•</span>
                <span>
                  The rover didn&apos;t take photos on that specific date/sol
                </span>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-400">
                <span>•</span>
                <span>The selected camera wasn&apos;t used that day</span>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-400">
                <span>•</span>
                <span>
                  The date is too recent (rovers need time to transmit data)
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              💡 Try using <strong>Sol numbers</strong> (like 1000, 2000) or{' '}
              <strong>older Earth dates</strong> for better results.
            </p>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl max-h-full relative">
            {/* Navigation Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <button
                onClick={() => navigateImage('prev')}
                className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors duration-200"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={closeImageModal}
                className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors duration-200"
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

              <button
                onClick={() => navigateImage('next')}
                className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors duration-200"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Main Image */}
            <img
              src={selectedImage.img_src}
              alt={`Mars surface captured by ${selectedImage.rover.name} rover`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
              <div className="text-center space-y-2">
                <h2 className="text-white font-bold text-2xl">
                  🔴 {selectedImage.rover.name} Rover
                </h2>
                <p className="text-gray-300 text-lg">
                  Sol {selectedImage.sol} • {selectedImage.camera.full_name}
                </p>
                <p className="text-gray-400">
                  Earth Date:{' '}
                  {new Date(selectedImage.earth_date).toLocaleDateString(
                    'en-US',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
