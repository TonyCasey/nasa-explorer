import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import DataWidget from '../components/DataWidget';
import MetricCard from '../components/MetricCard';
import StatusIndicator from '../components/StatusIndicator';
import NASAService from '../services/nasa.service';
import { APODResponse } from '../types/nasa.types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [apodData, setApodData] = useState<APODResponse | null>(null);
  const [apodLoading, setApodLoading] = useState(true);
  const [apodError, setApodError] = useState<string | null>(null);
  const [systemStatus] = useState({
    apiConnection: true,
    dataFreshness: 'good',
    lastUpdate: new Date(),
  });

  React.useEffect(() => {
    logger.info('Dashboard page loaded');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load today's APOD
      logger.debug('Loading dashboard data');
      const apod = await NASAService.getAPOD();
      setApodData(apod);
      logger.info('Dashboard APOD loaded successfully');
    } catch (error: any) {
      logger.error('Failed to load dashboard data', error as Error);

      // Check for 408 timeout error
      if (error.status === 408) {
        setApodError('NASA Server Timeout');
      } else {
        setApodError('Failed to load space image data');
      }
    } finally {
      setApodLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-inter font-bold text-gradient">
            🚀 Space Mission Control Dashboard
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Real-time monitoring of NASA space data, missions, and celestial
            events
          </p>
        </div>

        {/* System Status Bar */}
        <div className="glass-effect rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <StatusIndicator
                status="online"
                label="NASA APIs"
                description="All systems operational"
                size="small"
              />
              <StatusIndicator
                status="success"
                label="Data Stream"
                description={`Updated ${systemStatus.lastUpdate.toLocaleTimeString()}`}
                size="small"
              />
            </div>
            <div className="text-sm text-gray-400">
              Mission Control Active • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Missions"
            value={4}
            icon="🛰️"
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Mars Sol"
            value={4127}
            unit="days"
            icon="🔴"
            color="red"
          />
          <MetricCard
            title="NEO Tracked"
            value={28}
            unit="objects"
            icon="☄️"
            color="orange"
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Images Today"
            value={156}
            unit="photos"
            icon="📸"
            color="purple"
            trend={{ value: 23, isPositive: true }}
          />
        </div>

        {/* Main Data Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Space Image */}
          <DataWidget
            title="Today's Space Image"
            icon="🌌"
            description="Astronomy Picture of the Day"
            isLoading={apodLoading}
            error={apodError || undefined}
            onClick={() => navigate('/apod')}
            className="cursor-pointer hover:scale-105"
          >
            {apodData && (
              <div className="space-y-3">
                <div className="aspect-video rounded-lg overflow-hidden">
                  {apodData.media_type === 'image' ? (
                    <img
                      src={apodData.url}
                      alt={apodData.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-space-dark/50 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">🎬</span>
                        <p className="text-gray-300 text-sm">Video Content</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm leading-tight">
                    {apodData.title}
                  </h4>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {apodData.explanation?.substring(0, 120)}...
                  </p>
                </div>
              </div>
            )}
          </DataWidget>

          {/* Mars Mission Status */}
          <DataWidget
            title="Mars Exploration"
            icon="🔴"
            description="Active rover operations"
            onClick={() => navigate('/mars-rovers')}
            className="cursor-pointer hover:scale-105"
          >
            <div className="space-y-4">
              <StatusIndicator
                status="online"
                label="Perseverance"
                description="Sol 1,247 • Collecting samples"
                size="small"
              />
              <StatusIndicator
                status="online"
                label="Curiosity"
                description="Sol 4,127 • Analyzing terrain"
                size="small"
              />
              <StatusIndicator
                status="warning"
                label="Opportunity"
                description="Mission completed"
                size="small"
              />
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Photos today:</span>
                  <span className="text-solar-orange font-medium">47 new</span>
                </div>
              </div>
            </div>
          </DataWidget>

          {/* NEO Tracker */}
          <DataWidget
            title="Near Earth Objects"
            icon="☄️"
            description="Asteroid approach monitoring"
            onClick={() => navigate('/neo-tracker')}
            className="cursor-pointer hover:scale-105"
          >
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-aurora-green/10 border border-aurora-green/30">
                <span className="text-2xl">✅</span>
                <p className="text-aurora-green text-sm font-medium mt-2">
                  All Clear
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  No imminent threats detected
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Objects tracked:</span>
                  <span className="text-white font-medium">28,541</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Next close approach:</span>
                  <span className="text-stellar-yellow font-medium">
                    3.2 days
                  </span>
                </div>
              </div>
            </div>
          </DataWidget>
        </div>

        {/* Mission Timeline */}
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-2xl font-inter font-bold text-white mb-6">
            🗓️ Mission Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-cosmic-purple font-semibold">Today</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="text-aurora-green">✓</span>
                  <span className="text-gray-300">APOD image updated</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-stellar-yellow">⏳</span>
                  <span className="text-gray-300">Mars rover data sync</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-solar-orange font-semibold">This Week</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="text-stellar-yellow">📅</span>
                  <span className="text-gray-300">Artemis mission update</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cosmic-purple">🔭</span>
                  <span className="text-gray-300">
                    Webb telescope observation
                  </span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-mars-red font-semibold">Next Month</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="text-aurora-green">🚀</span>
                  <span className="text-gray-300">Europa Clipper launch</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-stellar-yellow">🌕</span>
                  <span className="text-gray-300">Lunar sample analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
