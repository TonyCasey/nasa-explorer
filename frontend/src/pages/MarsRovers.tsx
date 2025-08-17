import React, { useState, useEffect } from 'react';
import logger from '../utils/logger';
import PhotoGallery from '../components/PhotoGallery';
import RoverFilters, { IRoverFilters } from '../components/RoverFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusIndicator from '../components/StatusIndicator';
import NASAService from '../services/nasa.service';
import { MarsRoverPhoto } from '../types/nasa.types';

const MarsRovers: React.FC = () => {
  const [photos, setPhotos] = useState<MarsRoverPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<IRoverFilters>({
    rover: 'curiosity',
    sol: 1000, // Default to Sol 1000 which has many photos
    earthDate: '',
    camera: undefined,
  });

  const [roverStats, setRoverStats] = useState({
    totalPhotos: 0,
    lastUpdate: new Date(),
  });

  React.useEffect(() => {
    logger.info('Mars Rovers page loaded');
  }, []);

  useEffect(() => {
    loadPhotos(true); // Reset when filters change
  }, [filters]);

  const loadPhotos = async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const page = reset ? 1 : currentPage;
      logger.debug('Loading Mars rover photos', { ...filters, page });

      // Build params for the API call
      const params: any = {
        rover: filters.rover,
        page,
      };

      if (filters.sol) {
        params.sol = filters.sol;
      } else if (filters.earthDate) {
        params.earth_date = filters.earthDate;
      }

      if (filters.camera) {
        params.camera = filters.camera;
      }

      const response = await NASAService.getMarsRoverPhotos(params);
      const newPhotos = response.photos || [];

      if (reset) {
        setPhotos(newPhotos);
        setCurrentPage(2);
      } else {
        setPhotos((prev) => [...prev, ...newPhotos]);
        setCurrentPage((prev) => prev + 1);
      }

      // Update stats
      setRoverStats({
        totalPhotos: newPhotos.length,
        lastUpdate: new Date(),
      });

      // Check if there are more photos (if we got less than expected per page)
      setHasMore(newPhotos.length >= 25);

      logger.info('Mars rover photos loaded', {
        rover: filters.rover,
        count: newPhotos.length,
        page,
        total: reset ? newPhotos.length : photos.length + newPhotos.length,
      });
    } catch (err: any) {
      logger.error('Mars rover photos load error', err as Error, filters);

      // Check for 408 timeout error
      if (err.status === 408) {
        setError('NASA Server Timeout');
      } else {
        setError('Failed to load Mars rover photos');
      }

      if (reset) {
        setPhotos([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadPhotos(false);
    }
  };

  const handleFiltersChange = (newFilters: IRoverFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
    logger.info('Mars rover filters changed', newFilters);
  };

  const getRoverStatusColor = (rover: string) => {
    const activeRovers = ['curiosity', 'perseverance'];
    return activeRovers.includes(rover.toLowerCase()) ? 'online' : 'warning';
  };

  const getRoverEmoji = (rover: string) => {
    const emojis: { [key: string]: string } = {
      curiosity: '🔍',
      perseverance: '🎯',
      opportunity: '⚡',
      spirit: '👻',
    };
    return emojis[rover.toLowerCase()] || '🔴';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-inter font-bold text-gradient">
            🔴 Mars Rover Gallery
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Explore the Red Planet through the eyes of NASA's Mars rovers. From
            Curiosity's scientific discoveries to Perseverance's sample
            collection mission.
          </p>
        </div>

        {/* Status Bar */}
        <div className="glass-effect rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <StatusIndicator
                status={getRoverStatusColor(filters.rover)}
                label={`${getRoverEmoji(filters.rover)} ${filters.rover.charAt(0).toUpperCase() + filters.rover.slice(1)}`}
                description={
                  getRoverStatusColor(filters.rover) === 'online'
                    ? 'Active mission'
                    : 'Mission complete'
                }
                size="small"
              />
              <div className="text-sm text-gray-400">
                Photos found:{' '}
                <span className="text-white font-medium">{photos.length}</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Last updated: {roverStats.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Horizontal Filters */}
        <div className="glass-effect rounded-xl p-6">
          <RoverFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
            className="horizontal-layout"
          />
        </div>

        {/* Photo Gallery */}
        <div className="w-full">
          {isLoading && photos.length === 0 ? (
            <div className="glass-effect rounded-xl p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-300">Loading Mars rover photos...</p>
                <p className="text-gray-400 text-sm">
                  Fetching images from{' '}
                  {filters.rover.charAt(0).toUpperCase() +
                    filters.rover.slice(1)}{' '}
                  rover
                </p>
              </div>
            </div>
          ) : (
            <PhotoGallery
              photos={photos}
              isLoading={isLoading}
              error={error}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          )}
        </div>

        {/* Rover Information Panel */}
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-2xl font-inter font-bold text-white mb-6">
            🤖 Meet the Mars Rovers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Curiosity',
                emoji: '🔍',
                status: 'active',
                mission:
                  'Nuclear-powered rover studying Martian climate and geology',
                launched: '2011',
                landed: 'August 2012',
                location: 'Gale Crater',
              },
              {
                name: 'Perseverance',
                emoji: '🎯',
                status: 'active',
                mission:
                  'Searching for signs of ancient microbial life on Mars',
                launched: '2020',
                landed: 'February 2021',
                location: 'Jezero Crater',
              },
              {
                name: 'Opportunity',
                emoji: '⚡',
                status: 'complete',
                mission: 'Geological survey and atmospheric studies',
                launched: '2003',
                landed: 'January 2004',
                location: 'Meridiani Planum',
              },
              {
                name: 'Spirit',
                emoji: '👻',
                status: 'complete',
                mission: 'Geological exploration and climate analysis',
                launched: '2003',
                landed: 'January 2004',
                location: 'Gusev Crater',
              },
            ].map((rover) => (
              <div
                key={rover.name}
                className={`p-4 rounded-xl border transition-colors duration-200 ${
                  filters.rover === rover.name.toLowerCase()
                    ? 'border-cosmic-purple bg-cosmic-purple/10'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="text-3xl">{rover.emoji}</div>
                  <h3 className="font-inter font-bold text-white">
                    {rover.name}
                  </h3>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      rover.status === 'active'
                        ? 'bg-aurora-green/20 text-aurora-green'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {rover.status === 'active'
                      ? '🟢 Active'
                      : '🔴 Mission Complete'}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {rover.mission}
                  </p>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>🚀 Launched: {rover.launched}</div>
                    <div>🛬 Landed: {rover.landed}</div>
                    <div>📍 Location: {rover.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarsRovers;
