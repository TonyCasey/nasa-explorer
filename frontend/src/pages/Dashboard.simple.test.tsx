import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock all complex dependencies
jest.mock('../components/MetricCard', () => {
  return function MockMetricCard({ title }: any) {
    return <div data-testid="metric-card">{title}</div>;
  };
});

jest.mock('../components/StatusIndicator', () => {
  return function MockStatusIndicator({ status }: any) {
    return <div data-testid="status-indicator">{status}</div>;
  };
});

jest.mock('../components/LoadingSkeleton', () => {
  return function MockLoadingSkeleton() {
    return <div data-testid="loading-skeleton">Loading</div>;
  };
});

jest.mock('../services/nasa.service', () => ({
  nasaService: {
    getAPOD: jest.fn().mockResolvedValue({}),
    getMarsRoverPhotos: jest.fn().mockResolvedValue({ photos: [] }),
    getNEOFeed: jest.fn().mockResolvedValue({ near_earth_objects: {} }),
  },
}));

jest.mock('../hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  }),
}));

describe('Dashboard', () => {
  it('should render dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText(/mission control/i)).toBeInTheDocument();
  });

  it('should render metric cards', () => {
    render(<Dashboard />);
    const metricCards = screen.getAllByTestId('metric-card');
    expect(metricCards.length).toBeGreaterThan(0);
  });

  it('should render status indicators', () => {
    render(<Dashboard />);
    const statusIndicators = screen.getAllByTestId('status-indicator');
    expect(statusIndicators.length).toBeGreaterThan(0);
  });

  it('should handle loading state', () => {
    render(<Dashboard />);
    // Dashboard might show loading initially
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should render dashboard sections', () => {
    render(<Dashboard />);

    // Check for main dashboard sections
    expect(screen.getByText(/overview/i)).toBeInTheDocument();
    expect(screen.getByText(/recent/i)).toBeInTheDocument();
  });

  it('should handle responsive layout', () => {
    render(<Dashboard />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });

  it('should display system status', () => {
    render(<Dashboard />);
    expect(screen.getByText(/system/i)).toBeInTheDocument();
  });

  it('should render quick actions', () => {
    render(<Dashboard />);
    expect(screen.getByText(/quick/i)).toBeInTheDocument();
  });

  it('should handle data fetching', () => {
    render(<Dashboard />);
    // Component should render without errors
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display activity feed', () => {
    render(<Dashboard />);
    expect(screen.getByText(/activity/i)).toBeInTheDocument();
  });
});
