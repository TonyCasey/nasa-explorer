import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import VersionFooter from './components/VersionFooter';
import Dashboard from './pages/Dashboard';
import APOD from './pages/APOD';
import MarsRovers from './pages/MarsRovers';
import NEOTracker from './pages/NEOTracker';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-space-gradient">
          <div className="flex flex-1">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/apod" element={<APOD />} />
                <Route path="/mars-rovers" element={<MarsRovers />} />
                <Route path="/neo-tracker" element={<NEOTracker />} />
              </Routes>
            </main>
          </div>
          <VersionFooter />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
