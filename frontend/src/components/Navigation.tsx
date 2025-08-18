import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import VersionFooter from './VersionFooter';
import { useFavorites } from '../hooks/useFavorites';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { totalCount } = useFavorites();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isMobileMenuOpen &&
        !target.closest('.mobile-nav') &&
        !target.closest('.mobile-menu-button')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }

    // Return undefined when not adding event listener
    return undefined;
  }, [isMobileMenuOpen]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🚀' },
    { path: '/apod', label: 'Space Images', icon: '🌌' },
    { path: '/mars-rovers', label: 'Mars Rovers', icon: '🔴' },
    { path: '/neo-tracker', label: 'NEO Tracker', icon: '☄️' },
    { path: '/favorites', label: 'Favorites', icon: '⭐' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          className="mobile-menu-button lg:hidden fixed top-4 left-4 p-3 glass-effect rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          aria-label="Toggle navigation menu"
          style={{
            pointerEvents: 'auto',
            zIndex: 9999,
            position: 'fixed',
          }}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}
            ></span>
          </div>
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Navigation Sidebar */}
      <nav
        className={`mobile-nav glass-effect border-r border-white/20 min-h-screen w-64 p-6 ${
          isMobile
            ? `fixed top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
        }`}
      >
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
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.path === '/favorites' && totalCount > 0 && (
                    <span className="bg-solar-orange text-white text-xs px-2 py-0.5 rounded-full">
                      {totalCount}
                    </span>
                  )}
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
    </>
  );
};

export default Navigation;
