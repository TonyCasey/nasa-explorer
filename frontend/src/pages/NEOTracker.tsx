import React, { useState, useEffect } from 'react';
import logger from '../utils/logger';
import NEOCard from '../components/NEOCard';
import NEOChart from '../components/NEOChart';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusIndicator from '../components/StatusIndicator';
import DatePicker from '../components/DatePicker';
import NASAService from '../services/nasa.service';
import { NEOObject } from '../types/nasa.types';

const NEOTracker: React.FC = () => {
  const [neos, setNeos] = useState<NEOObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(() => {
    // Ensure end date is never in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today.toISOString().split('T')[0];
  });
  const [selectedNEO, setSelectedNEO] = useState<NEOObject | null>(null);

  React.useEffect(() => {
    logger.info('NEO Tracker page loaded');
  }, []);

  useEffect(() => {
    loadNEOData();
  }, [selectedDate, endDate]);

  const loadNEOData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('Loading NEO data', { startDate: selectedDate, endDate });

      const response = await NASAService.getNEOFeed({
        startDate: selectedDate,
        endDate: endDate,
      });

      // Flatten the NEO data from all dates
      const allNEOs: NEOObject[] = [];
      Object.values(response.near_earth_objects).forEach((dateNEOs: any) => {
        allNEOs.push(...dateNEOs);
      });

      // Sort by closest approach date
      allNEOs.sort((a, b) => {
        const dateA = new Date(a.close_approach_data[0].close_approach_date);
        const dateB = new Date(b.close_approach_data[0].close_approach_date);
        return dateA.getTime() - dateB.getTime();
      });

      setNeos(allNEOs);
      logger.info('NEO data loaded successfully', {
        count: allNEOs.length,
        hazardous: allNEOs.filter(
          (neo) => neo.is_potentially_hazardous_asteroid
        ).length,
      });
    } catch (err: any) {
      logger.error('NEO data load error', err as Error, {
        selectedDate,
        endDate,
      });

      // Check for 408 timeout error
      if (err.status === 408) {
        setError('NASA Server Timeout');
      } else {
        setError('Failed to load NEO tracking data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);

    // Validate date before processing
    const startDate = new Date(date);
    if (isNaN(startDate.getTime())) {
      // Invalid date, don't update end date or make API call
      return;
    }

    // Auto-adjust end date to be 7 days after start date, but never exceed today
    const potentialEndDate = new Date(
      startDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Use the earlier of: 7 days after start date OR today
    const newEndDate = potentialEndDate > today ? today : potentialEndDate;
    setEndDate(newEndDate.toISOString().split('T')[0]);

    logger.info('NEO date range changed', {
      startDate: date,
      endDate: newEndDate.toISOString().split('T')[0],
      capped: potentialEndDate > today,
    });
  };

  const getOverallRiskStatus = () => {
    const hazardousCount = neos.filter(
      (neo) => neo.is_potentially_hazardous_asteroid
    ).length;
    const closeCount = neos.filter(
      (neo) => parseFloat(neo.close_approach_data[0].miss_distance.lunar) < 5
    ).length;

    if (hazardousCount > 0 && closeCount > 0) {
      return {
        status: 'error' as const,
        label: 'High Alert',
        description: `${hazardousCount} hazardous objects approaching`,
      };
    } else if (hazardousCount > 0) {
      return {
        status: 'warning' as const,
        label: 'Monitor',
        description: `${hazardousCount} potentially hazardous objects`,
      };
    } else if (closeCount > 0) {
      return {
        status: 'warning' as const,
        label: 'Active',
        description: `${closeCount} close approaches detected`,
      };
    } else {
      return {
        status: 'success' as const,
        label: 'All Clear',
        description: 'No immediate threats detected',
      };
    }
  };

  const riskStatus = getOverallRiskStatus();

  const hazardousNEOs = neos.filter(
    (neo) => neo.is_potentially_hazardous_asteroid
  );
  const upcomingNEOs = neos.slice(0, 6); // Next 6 objects

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-inter font-bold text-gradient">
            ☄️ Near Earth Objects Tracker
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Real-time monitoring of asteroids and comets approaching Earth.
            Track potentially hazardous objects and assess impact risks.
          </p>
        </div>

        {/* Status Bar */}
        <div className="glass-effect rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <StatusIndicator
                status={riskStatus.status}
                label={riskStatus.label}
                description={riskStatus.description}
                size="small"
              />
              <div className="text-sm text-gray-400">
                Objects tracked:{' '}
                <span className="text-white font-medium">{neos.length}</span>
              </div>
              <div className="text-sm text-gray-400">
                Date range:{' '}
                <span className="text-white font-medium">
                  {new Date(selectedDate).toLocaleDateString()} -{' '}
                  {new Date(endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-8">
          <div className="glass-effect rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-xl font-inter font-semibold text-white mb-4">
                  📅 Select Date Range
                </h2>
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  maxDate={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <h3 className="text-xl font-inter font-semibold text-white mb-4">
                  ⚠️ Risk Levels
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-mars-red">🔴</span>
                    <span className="text-gray-300 font-medium">
                      Potentially Hazardous
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-stellar-yellow">🟡</span>
                    <span className="text-gray-300 font-medium">
                      Close Approach (&lt;10 LD)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-aurora-green">🟢</span>
                    <span className="text-gray-300 font-medium">
                      Safe Distance
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-inter font-semibold text-white mb-4">
                  📡 Current Scan
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">
                    <span className="font-medium">Objects:</span>{' '}
                    <span className="text-white font-semibold">
                      {neos.length}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    <span className="font-medium">Hazardous:</span>{' '}
                    <span className="text-mars-red font-semibold">
                      {hazardousNEOs.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Data Visualization */}
            {!isLoading && !error && <NEOChart neos={neos} />}

            {/* Hazardous Objects Alert */}
            {hazardousNEOs.length > 0 && (
              <div className="glass-effect rounded-xl p-6 border-l-4 border-mars-red">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h2 className="text-xl font-inter font-bold text-mars-red">
                      Potentially Hazardous Asteroids
                    </h2>
                    <p className="text-gray-300">
                      {hazardousNEOs.length} object
                      {hazardousNEOs.length > 1 ? 's' : ''} requiring monitoring
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hazardousNEOs.slice(0, 4).map((neo) => (
                    <NEOCard
                      key={neo.id}
                      neo={neo}
                      onClick={() => setSelectedNEO(neo)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="glass-effect rounded-xl p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-300">
                    Scanning for near Earth objects...
                  </p>
                  <p className="text-gray-400 text-sm">
                    Analyzing orbital data from {selectedDate} to {endDate}
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="glass-effect rounded-xl p-12">
                <div className="text-center space-y-4">
                  <span className="text-6xl">🚫</span>
                  <h3 className="text-xl font-semibold text-mars-red">
                    Failed to Load NEO Data
                  </h3>
                  <p className="text-gray-400">{error}</p>
                  <button
                    onClick={loadNEOData}
                    className="bg-cosmic-purple hover:bg-cosmic-purple/80 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Retry Scan
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Approaches */}
            {!isLoading && !error && neos.length > 0 && (
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-inter font-bold text-white mb-6">
                  📡 Upcoming Close Approaches
                </h2>

                {upcomingNEOs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {upcomingNEOs.map((neo) => (
                      <NEOCard
                        key={neo.id}
                        neo={neo}
                        onClick={() => setSelectedNEO(neo)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">🌌</span>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      All Clear
                    </h3>
                    <p className="text-gray-400">
                      No significant close approaches in the selected date range
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* NEO Detail Modal */}
        {selectedNEO && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full max-h-full overflow-y-auto">
              <div className="glass-effect rounded-xl p-8 relative">
                <button
                  onClick={() => setSelectedNEO(null)}
                  className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors duration-200"
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

                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-inter font-bold text-white mb-2">
                      {selectedNEO.name.replace(/[()]/g, '')}
                    </h2>
                    <p className="text-gray-400">Object ID: {selectedNEO.id}</p>
                  </div>

                  <NEOCard neo={selectedNEO} />

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">JPL URL:</span>
                          <a
                            href={selectedNEO.nasa_jpl_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cosmic-purple hover:text-cosmic-purple/80"
                          >
                            View Details 🔗
                          </a>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Orbit Class:</span>
                          <span className="text-white">
                            Near Earth Asteroid
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Discovery:</span>
                          <span className="text-white">NASA/JPL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span
                            className={`font-medium ${
                              selectedNEO.is_potentially_hazardous_asteroid
                                ? 'text-mars-red'
                                : 'text-aurora-green'
                            }`}
                          >
                            {selectedNEO.is_potentially_hazardous_asteroid
                              ? 'Hazardous'
                              : 'Safe'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NEOTracker;
