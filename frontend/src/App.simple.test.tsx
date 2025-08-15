import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all the complex dependencies
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => <div data-testid="router">{children}</div>,
  Routes: ({ children }: any) => <div data-testid="routes">{children}</div>,
  Route: ({ children }: any) => <div data-testid="route">{children}</div>,
  Navigate: () => <div data-testid="navigate">Navigate</div>
}));

jest.mock('./pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

jest.mock('./pages/APOD', () => {
  return function MockAPOD() {
    return <div data-testid="apod">APOD</div>;
  };
});

jest.mock('./pages/MarsRovers', () => {
  return function MockMarsRovers() {
    return <div data-testid="mars-rovers">Mars Rovers</div>;
  };
});

jest.mock('./pages/NEOTracker', () => {
  return function MockNEOTracker() {
    return <div data-testid="neo-tracker">NEO Tracker</div>;
  };
});

jest.mock('./pages/Favorites', () => {
  return function MockFavorites() {
    return <div data-testid="favorites">Favorites</div>;
  };
});

jest.mock('./components/VersionFooter', () => {
  return function MockVersionFooter() {
    return <div data-testid="version-footer">Version Footer</div>;
  };
});

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('should render routes container', () => {
    render(<App />);
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('should render version footer', () => {
    render(<App />);
    expect(screen.getByTestId('version-footer')).toBeInTheDocument();
  });

  it('should have proper app structure', () => {
    render(<App />);
    const router = screen.getByTestId('router');
    expect(router).toBeInTheDocument();
  });

  it('should handle routing setup', () => {
    render(<App />);
    // Verify that routing components are rendered
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });
});