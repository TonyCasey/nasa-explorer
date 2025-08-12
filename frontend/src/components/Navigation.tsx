import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import VersionFooter from './VersionFooter';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🚀' },
    { path: '/apod', label: 'Space Images', icon: '🌌' },
    { path: '/mars-rovers', label: 'Mars Rovers', icon: '🔴' },
    { path: '/neo-tracker', label: 'NEO Tracker', icon: '☄️' },
  ];

  return (
    <nav className="glass-effect border-r border-white/20 min-h-screen w-64 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-inter font-bold text-gradient">
          NASA Explorer
        </h1>
        <p className="text-gray-400 text-sm mt-2">Space Data Dashboard</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-cosmic-purple/20 text-white glow'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-8">
        <div className="glass-effect rounded-lg p-4">
          <p className="text-xs text-gray-400 text-center mb-2">
            Powered by NASA APIs
          </p>
          <VersionFooter minimal className="text-center" />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
