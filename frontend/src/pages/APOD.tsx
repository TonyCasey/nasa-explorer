import React, { useState, useEffect } from 'react';
import logger from '../utils/logger';
import DatePicker from '../components/DatePicker';
import LoadingSpinner from '../components/LoadingSpinner';
import FavoriteButton from '../components/FavoriteButton';
import NASAService from '../services/nasa.service';
import { APODResponse } from '../types/nasa.types';

const APOD: React.FC = () => {
  const [apodData, setApodData] = useState<APODResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  React.useEffect(() => {
    logger.info('APOD page loaded');
  }, []);

  useEffect(() => {
    loadAPODData(selectedDate);
  }, [selectedDate]);

  const loadAPODData = async (date?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('Loading APOD data', { date });

      const response = await NASAService.getAPOD(date);
      setApodData(response);
      logger.info('APOD data loaded successfully', {
        date,
        title: response.title,
      });
    } catch (err: any) {
      logger.error('APOD load error', err as Error, { date });

      // Check for 408 timeout error
      if (err.status === 408) {
        setError('NASA Server Timeout');
      } else {
        setError('Failed to load astronomy picture');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    logger.info('APOD date changed', { date });
  };

  const shareImage = () => {
    if (apodData) {
      const text = `Check out today's space image: ${apodData.title}`;
      const url = window.location.href;

      if (navigator.share) {
        navigator.share({
          title: apodData.title,
          text,
          url,
        });
      } else {
        // Fallback to copying URL
        navigator.clipboard.writeText(`${text} - ${url}`);
        // You could show a toast notification here
      }
      logger.info('APOD shared', { title: apodData.title });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-inter font-bold text-gradient">
            🌌 Astronomy Picture of the Day
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover the cosmos through NASA's daily featured space imagery and
            astronomical phenomena
          </p>
        </div>

        {/* Date Selection */}
        <div className="space-y-8">
          <div className="glass-effect rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-xl font-inter font-semibold text-white mb-4">
                  📅 Select Date
                </h2>
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                />
              </div>

              {apodData && (
                <>
                  <div>
                    <h3 className="text-xl font-inter font-semibold text-white mb-4">
                      🌟 Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm font-medium">
                          Save for later
                        </span>
                        <FavoriteButton
                          item={{
                            id: `apod-${selectedDate}`,
                            type: 'apod',
                            title: apodData.title,
                            thumbnail:
                              apodData.media_type === 'image'
                                ? apodData.url
                                : apodData.url,
                            data: apodData,
                          }}
                          size="lg"
                          className="text-gray-300 hover:text-solar-orange"
                        />
                      </div>
                      <button
                        onClick={shareImage}
                        className="w-full bg-cosmic-purple/20 hover:bg-cosmic-purple/30 text-cosmic-purple border border-cosmic-purple/30 rounded-lg py-2 px-3 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                        <span>Share Image</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-inter font-semibold text-white mb-4">
                      📊 Image Info
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-300">
                        <span className="font-medium">Date:</span>{' '}
                        <span className="text-white font-semibold">
                          {new Date(selectedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium">Type:</span>{' '}
                        <span className="text-white font-semibold">
                          {apodData.media_type === 'image' ? 'Image' : 'Video'}
                        </span>
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium">Copyright:</span>{' '}
                        <span className="text-white font-semibold">
                          {apodData.copyright || 'NASA'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div>
            {isLoading ? (
              <div className="glass-effect rounded-xl p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-300">Loading astronomy picture...</p>
                </div>
              </div>
            ) : error ? (
              <div className="glass-effect rounded-xl p-12">
                <div className="text-center space-y-4">
                  <span className="text-6xl">🚫</span>
                  <h3 className="text-xl font-semibold text-mars-red">
                    Failed to Load Image
                  </h3>
                  <p className="text-gray-400">{error}</p>
                  <button
                    onClick={() => loadAPODData(selectedDate)}
                    className="bg-cosmic-purple hover:bg-cosmic-purple/80 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : apodData ? (
              <div className="space-y-6">
                {/* Image/Video */}
                <div className="glass-effect rounded-xl overflow-hidden p-4">
                  {apodData.media_type === 'image' ? (
                    <div className="relative">
                      <img
                        src={apodData.url}
                        alt={apodData.title}
                        className="w-full h-auto object-contain max-h-96 mx-auto"
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video">
                      <iframe
                        src={apodData.url}
                        title={apodData.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="glass-effect rounded-xl p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <h2 className="text-3xl font-inter font-bold text-white leading-tight">
                          {apodData.title}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>
                            📅{' '}
                            {new Date(selectedDate).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </span>
                          {apodData.copyright && (
                            <span>📷 © {apodData.copyright}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {apodData.explanation}
                    </p>
                  </div>

                  {/* Technical Details */}
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      📊 Technical Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Media Type:</span>
                          <span className="text-white font-medium">
                            {apodData.media_type === 'image'
                              ? '🖼️ Image'
                              : '🎬 Video'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="text-white font-medium">
                            {apodData.date}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {apodData.hdurl && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">HD Version:</span>
                            <a
                              href={apodData.hdurl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cosmic-purple hover:text-cosmic-purple/80 font-medium transition-colors duration-200"
                            >
                              View HD 🔗
                            </a>
                          </div>
                        )}
                        {apodData.copyright && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Copyright:</span>
                            <span className="text-white font-medium">
                              {apodData.copyright}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APOD;
