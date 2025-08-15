import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';

export interface IRoverFilters {
  rover: string;
  sol?: number;
  camera?: string;
  earthDate?: string;
}

interface RoverFiltersProps {
  filters: IRoverFilters;
  onFiltersChange: (filters: IRoverFilters) => void;
  isLoading?: boolean;
  className?: string;
}

const ROVERS = [
  { id: 'curiosity', name: 'Curiosity', emoji: '🔍', status: 'active' },
  { id: 'perseverance', name: 'Perseverance', emoji: '🎯', status: 'active' },
  { id: 'opportunity', name: 'Opportunity', emoji: '⚡', status: 'complete' },
  { id: 'spirit', name: 'Spirit', emoji: '👻', status: 'complete' },
];

const CAMERAS = {
  curiosity: [
    { id: 'FHAZ', name: 'Front Hazard Avoidance Camera' },
    { id: 'RHAZ', name: 'Rear Hazard Avoidance Camera' },
    { id: 'MAST', name: 'Mast Camera' },
    { id: 'CHEMCAM', name: 'Chemistry and Camera Complex' },
    { id: 'MAHLI', name: 'Mars Hand Lens Imager' },
    { id: 'MARDI', name: 'Mars Descent Imager' },
  ],
  perseverance: [
    { id: 'FHAZ', name: 'Front Hazard Avoidance Camera' },
    { id: 'RHAZ', name: 'Rear Hazard Avoidance Camera' },
    { id: 'MAST', name: 'Mast Camera' },
    { id: 'SUPERCAM', name: 'SuperCam' },
  ],
  opportunity: [
    { id: 'FHAZ', name: 'Front Hazard Avoidance Camera' },
    { id: 'RHAZ', name: 'Rear Hazard Avoidance Camera' },
    { id: 'NAVCAM', name: 'Navigation Camera' },
    { id: 'PANCAM', name: 'Panoramic Camera' },
    { id: 'MINITES', name: 'Miniature Thermal Emission Spectrometer' },
  ],
  spirit: [
    { id: 'FHAZ', name: 'Front Hazard Avoidance Camera' },
    { id: 'RHAZ', name: 'Rear Hazard Avoidance Camera' },
    { id: 'NAVCAM', name: 'Navigation Camera' },
    { id: 'PANCAM', name: 'Panoramic Camera' },
    { id: 'MINITES', name: 'Miniature Thermal Emission Spectrometer' },
  ],
};

const RoverFilters: React.FC<RoverFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading = false,
  className = '',
}) => {
  const [localSolValue, setLocalSolValue] = useState(filters.sol?.toString() || '');
  const availableCameras = CAMERAS[filters.rover as keyof typeof CAMERAS] || [];

  // Sync local sol value with filters when filters change externally
  useEffect(() => {
    setLocalSolValue(filters.sol?.toString() || '');
  }, [filters.sol]);

  const handleRoverChange = (rover: string) => {
    onFiltersChange({
      ...filters,
      rover,
      camera: '', // Reset camera when rover changes
    });
  };

  const handleSolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update local state on change, don't trigger API call yet
    setLocalSolValue(e.target.value);
  };

  const handleSolBlur = () => {
    // Only update filters (trigger API call) when user finishes typing
    const value = localSolValue.trim();
    onFiltersChange({
      ...filters,
      sol: value ? parseInt(value) : undefined,
      earthDate: '', // Clear earth date when sol is set
    });
  };

  const handleSolKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow Enter key to trigger search immediately
    if (e.key === 'Enter') {
      handleSolBlur();
    }
  };


  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      camera: e.target.value || undefined,
    });
  };

  const clearFilters = () => {
    setLocalSolValue(''); // Clear local state
    onFiltersChange({
      rover: 'curiosity',
      sol: undefined,
      earthDate: '',
      camera: undefined,
    });
  };

  const getRandomSol = () => {
    // Generate a random sol between 1 and 3000 (approximate range)
    const randomSol = Math.floor(Math.random() * 3000) + 1;
    setLocalSolValue(randomSol.toString()); // Update local state
    onFiltersChange({
      ...filters,
      sol: randomSol,
      earthDate: '',
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-inter font-semibold text-white">
          🔍 Filter Mars Photos
        </h2>
        <button
          onClick={clearFilters}
          disabled={isLoading}
          className="text-sm text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
        >
          Clear All
        </button>
      </div>

      {/* Rover Selection */}
      <div className="space-y-3">
        <label className="text-white font-medium text-sm">Select Rover:</label>
        <div className="grid grid-cols-2 gap-3">
          {ROVERS.map((rover) => (
            <button
              key={rover.id}
              onClick={() => handleRoverChange(rover.id)}
              disabled={isLoading}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50
                ${
                  filters.rover === rover.id
                    ? 'border-cosmic-purple bg-cosmic-purple/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                }
              `}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">{rover.emoji}</div>
                <div className="font-medium text-sm leading-tight break-words">{rover.name}</div>
                <div
                  className={`text-xs ${
                    rover.status === 'active'
                      ? 'text-aurora-green'
                      : 'text-gray-400'
                  }`}
                >
                  {rover.status === 'active'
                    ? '🟢 Active'
                    : '🔴 Mission Complete'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date/Sol Selection */}
      <div className="space-y-4">
        <label className="text-white font-medium text-sm">
          Select Date or Sol:
        </label>

        {/* Sol Input */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-sm">Mars Sol:</label>
            <button
              onClick={getRandomSol}
              className="text-xs text-cosmic-purple hover:text-cosmic-purple/80 transition-colors duration-200"
            >
              🎲 Random
            </button>
          </div>
          <input
            type="number"
            min="1"
            max="4000"
            placeholder="e.g., 1000"
            value={localSolValue}
            onChange={handleSolChange}
            onBlur={handleSolBlur}
            onKeyPress={handleSolKeyPress}
            disabled={isLoading}
            className="w-full glass-effect rounded-lg p-3 text-white placeholder-gray-400 border border-white/20 focus:border-cosmic-purple/50 focus:outline-none transition-colors duration-200 disabled:opacity-50"
          />
          <p className="text-xs text-gray-400">
            Sol = Martian day (leave empty for latest photos)
          </p>
        </div>

        {/* Earth Date Input */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-sm">Or Earth Date:</label>
            <button
              onClick={() => onFiltersChange({ ...filters, earthDate: '2025-08-01', sol: undefined })}
              className="text-xs text-cosmic-purple hover:text-cosmic-purple/80 transition-colors duration-200"
            >
              📡 Latest
            </button>
          </div>
          <DatePicker
            selectedDate={filters.earthDate || new Date().toISOString().split('T')[0]}
            onDateChange={(date) => onFiltersChange({ ...filters, earthDate: date, sol: undefined })}
            minDate="2004-01-01"
            maxDate="2025-08-01"
            className="w-full"
            opacity={70}
          />
          <p className="text-xs text-gray-400">
            📡 Latest available photos are from August 1, 2025 (NASA data has processing delays)
          </p>
        </div>
      </div>

      {/* Camera Selection */}
      <div className="space-y-3">
        <label className="text-white font-medium text-sm">
          Camera (Optional):
        </label>
        <select
          value={filters.camera || ''}
          onChange={handleCameraChange}
          disabled={isLoading || availableCameras.length === 0}
          className="w-full glass-effect rounded-lg p-3 text-white border border-white/20 focus:border-cosmic-purple/50 focus:outline-none transition-colors duration-200 disabled:opacity-50"
        >
          <option value="">All Cameras</option>
          {availableCameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.id} - {camera.name}
            </option>
          ))}
        </select>
        {availableCameras.length === 0 && (
          <p className="text-xs text-gray-400">
            Select a rover first to see available cameras
          </p>
        )}
      </div>

      {/* Filter Summary */}
      <div className="glass-effect rounded-lg p-4 border border-white/10">
        <h3 className="text-sm font-medium text-white mb-2">
          Current Filters:
        </h3>
        <div className="space-y-1 text-xs text-gray-300">
          <div>
            🔴 Rover: <span className="text-white">{filters.rover}</span>
          </div>
          {filters.sol && (
            <div>
              📅 Sol: <span className="text-white">{filters.sol}</span>
            </div>
          )}
          {filters.earthDate && (
            <div>
              🌍 Date:{' '}
              <span className="text-white">
                {new Date(filters.earthDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {filters.camera && (
            <div>
              📷 Camera: <span className="text-white">{filters.camera}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoverFilters;
