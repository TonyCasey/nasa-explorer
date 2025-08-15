import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

interface NEOData {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_second: string;
    };
    miss_distance: {
      kilometers: string;
      lunar: string;
    };
  }>;
}

interface NEOChartProps {
  neos: NEOData[];
  className?: string;
}

const NEOChart: React.FC<NEOChartProps> = ({ neos, className = '' }) => {
  // Prepare data for different charts
  const hazardData = [
    { name: 'Safe', value: neos.filter(n => !n.is_potentially_hazardous_asteroid).length, color: '#10B981' },
    { name: 'Hazardous', value: neos.filter(n => n.is_potentially_hazardous_asteroid).length, color: '#EF4444' },
  ];

  const sizeData = [
    { 
      name: 'Small (<140m)', 
      value: neos.filter(n => {
        const avg = (n.estimated_diameter.kilometers.estimated_diameter_min + n.estimated_diameter.kilometers.estimated_diameter_max) / 2;
        return avg <= 0.14;
      }).length,
      color: '#6366F1'
    },
    { 
      name: 'Medium (140m-1km)', 
      value: neos.filter(n => {
        const avg = (n.estimated_diameter.kilometers.estimated_diameter_min + n.estimated_diameter.kilometers.estimated_diameter_max) / 2;
        return avg > 0.14 && avg <= 1;
      }).length,
      color: '#F59E0B'
    },
    { 
      name: 'Large (>1km)', 
      value: neos.filter(n => {
        const avg = (n.estimated_diameter.kilometers.estimated_diameter_min + n.estimated_diameter.kilometers.estimated_diameter_max) / 2;
        return avg > 1;
      }).length,
      color: '#EF4444'
    },
  ];

  const distanceData = [
    { name: '<5 LD', value: neos.filter(n => parseFloat(n.close_approach_data[0].miss_distance.lunar) < 5).length },
    { name: '5-20 LD', value: neos.filter(n => {
      const dist = parseFloat(n.close_approach_data[0].miss_distance.lunar);
      return dist >= 5 && dist < 20;
    }).length },
    { name: '>20 LD', value: neos.filter(n => parseFloat(n.close_approach_data[0].miss_distance.lunar) >= 20).length },
  ];

  // Prepare scatter plot data for size vs distance
  const scatterData = neos.slice(0, 50).map(neo => ({
    name: neo.name,
    distance: parseFloat(neo.close_approach_data[0].miss_distance.lunar),
    size: (neo.estimated_diameter.kilometers.estimated_diameter_min + neo.estimated_diameter.kilometers.estimated_diameter_max) / 2,
    velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
    hazardous: neo.is_potentially_hazardous_asteroid,
  }));

  // Prepare velocity distribution
  const velocityRanges = [
    { range: '0-10 km/s', count: 0 },
    { range: '10-20 km/s', count: 0 },
    { range: '20-30 km/s', count: 0 },
    { range: '>30 km/s', count: 0 },
  ];

  neos.forEach(neo => {
    const velocity = parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second);
    if (velocity < 10) velocityRanges[0].count++;
    else if (velocity < 20) velocityRanges[1].count++;
    else if (velocity < 30) velocityRanges[2].count++;
    else velocityRanges[3].count++;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-space-dark/90 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-300 text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-space-dark/90 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-300 text-sm">Distance: {data.distance.toFixed(2)} LD</p>
          <p className="text-gray-300 text-sm">Size: {(data.size * 1000).toFixed(0)} m</p>
          <p className="text-gray-300 text-sm">Velocity: {data.velocity.toFixed(1)} km/s</p>
          <p className={`text-sm ${data.hazardous ? 'text-mars-red' : 'text-aurora-green'}`}>
            {data.hazardous ? 'Potentially Hazardous' : 'Safe'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (neos.length === 0) {
    return (
      <div className={`glass-effect rounded-xl p-8 text-center ${className}`}>
        <span className="text-6xl mb-4 block">📊</span>
        <h3 className="text-xl font-semibold text-white mb-2">
          No Data Available
        </h3>
        <p className="text-gray-400">Load NEO data to see visualization</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-white mb-1">{neos.length}</div>
          <div className="text-gray-300 text-sm">Total NEOs</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center border-l-4 border-mars-red">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-2xl font-bold text-mars-red mb-1">
            {neos.filter(n => n.is_potentially_hazardous_asteroid).length}
          </div>
          <div className="text-gray-300 text-sm">Hazardous</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center border-l-4 border-cosmic-purple">
          <div className="text-2xl mb-2">📏</div>
          <div className="text-2xl font-bold text-cosmic-purple mb-1">
            {Math.max(...neos.map(n => (n.estimated_diameter.kilometers.estimated_diameter_max * 1000))).toFixed(0)}m
          </div>
          <div className="text-gray-300 text-sm">Largest</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center border-l-4 border-solar-orange">
          <div className="text-2xl mb-2">🚀</div>
          <div className="text-2xl font-bold text-solar-orange mb-1">
            {Math.max(...neos.map(n => parseFloat(n.close_approach_data[0].relative_velocity.kilometers_per_second))).toFixed(1)} km/s
          </div>
          <div className="text-gray-300 text-sm">Fastest</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hazard Status Pie Chart */}
        <div className="glass-effect rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4">Hazard Classification</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={hazardData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {hazardData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Size Distribution Bar Chart */}
        <div className="glass-effect rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4">Size Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sizeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#6366F1">
                {sizeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distance Distribution */}
        <div className="glass-effect rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4">Distance from Earth (Lunar Distances)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Velocity Distribution */}
        <div className="glass-effect rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4">Velocity Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={velocityRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Size vs Distance Scatter Plot */}
      <div className="glass-effect rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4">Size vs Distance Analysis (Top 50 NEOs)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="distance" 
              name="Distance" 
              unit=" LD" 
              stroke="#9CA3AF"
              label={{ value: 'Distance (Lunar Distances)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="size" 
              name="Size" 
              unit=" km" 
              stroke="#9CA3AF"
              label={{ value: 'Size (km)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<ScatterTooltip />} />
            <Scatter name="NEOs" data={scatterData} fill="#6366F1">
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.hazardous ? '#EF4444' : '#10B981'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-aurora-green rounded-full"></div>
            <span className="text-gray-300 text-sm">Safe</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-mars-red rounded-full"></div>
            <span className="text-gray-300 text-sm">Potentially Hazardous</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NEOChart;