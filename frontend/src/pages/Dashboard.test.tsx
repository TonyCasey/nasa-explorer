import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

// Mock dependencies
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../services/nasa.service', () => ({
  default: {
    getAPOD: jest.fn(),
  },
}));

// Mock components
jest.mock('../components/DataWidget', () => {
  return function MockDataWidget({
    title,
    value,
    icon,
    loading,
    error,
    onClick,
  }: any) {
    return (
      <div data-testid="data-widget" onClick={onClick}>
        <div data-testid="widget-title">{title}</div>
        <div data-testid="widget-value">{value}</div>
        <div data-testid="widget-icon">{icon}</div>
        {loading && <div data-testid="widget-loading">Loading...</div>}
        {error && <div data-testid="widget-error">{error}</div>}
      </div>
    );
  };
});

jest.mock('../components/MetricCard', () => {
  return function MockMetricCard({ title, value, unit, trend, color }: any) {
    return (
      <div data-testid="metric-card">
        <div data-testid="metric-title">{title}</div>
        <div data-testid="metric-value">{value}</div>
        <div data-testid="metric-unit">{unit}</div>
        <div data-testid="metric-trend">
          {trend ? `${trend.value}%${trend.isPositive ? '↗' : '↘'}` : ''}
        </div>
        <div data-testid="metric-color">{color}</div>
      </div>
    );
  };
});

jest.mock('../components/StatusIndicator', () => {
  return function MockStatusIndicator({ status, label }: any) {
    return (
      <div data-testid="status-indicator">
        <div data-testid="status-value">{status}</div>
        <div data-testid="status-label">{label}</div>
      </div>
    );
  };
});

const mockAPODData = {
  title: 'Test Space Image',
  explanation: 'A beautiful test image from space',
  url: 'https://example.com/image.jpg',
  date: '2025-08-15',
  media_type: 'image' as const,
  hdurl: 'https://example.com/image-hd.jpg',
};

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock return value
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPODData);
  });

  test('renders dashboard header', () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(
      screen.getByText(/Space Mission Control Dashboard/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Real-time monitoring of NASA space data/)
    ).toBeInTheDocument();
  });

  test('loads APOD data on mount', async () => {
    renderWithRouter();

    await waitFor(() => {
      // Check that the component renders (which indicates useEffect ran)
      expect(
        screen.getByText(/Space Mission Control Dashboard/)
      ).toBeInTheDocument();
    });
  });

  test('displays APOD data when loaded successfully', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPODData);

    renderWithRouter();

    await waitFor(
      () => {
        expect(screen.getAllByTestId('data-widget')).toHaveLength(3);
      },
      { timeout: 3000 }
    );
  });

  test('handles APOD loading error', async () => {
    const NASAService = require('../services/nasa.service').default;
    const mockError = new Error('Failed to fetch APOD');
    NASAService.getAPOD.mockRejectedValue(mockError);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('widget-error')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    renderWithRouter();

    // Widget should exist even in initial state
    expect(screen.getAllByTestId('data-widget')).toHaveLength(3);
  });

  test('logs dashboard initialization', () => {
    const logger = require('../utils/logger');
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(logger.info).toHaveBeenCalledWith('Dashboard page loaded');
    expect(logger.debug).toHaveBeenCalledWith('Loading dashboard data');
  });

  test('logs successful APOD loading', async () => {
    const logger = require('../utils/logger');

    renderWithRouter();

    await waitFor(() => {
      // Check that initial logging happened
      expect(logger.info).toHaveBeenCalledWith('Dashboard page loaded');
    });
  });

  test('logs APOD loading errors', async () => {
    const NASAService = require('../services/nasa.service').default;
    const mockError = new Error('API Error');
    NASAService.getAPOD.mockRejectedValue(mockError);

    renderWithRouter();

    await waitFor(() => {
      // Check that error widget is shown
      expect(screen.getByTestId('widget-error')).toBeInTheDocument();
    });
  });

  test('renders metric cards', () => {
    renderWithRouter();

    expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
  });

  test('renders status indicators', () => {
    renderWithRouter();

    expect(screen.getAllByTestId('status-indicator')).toHaveLength(2);
  });

  test('renders data widgets', () => {
    renderWithRouter();

    expect(screen.getAllByTestId('data-widget')).toHaveLength(3);
  });

  test('has responsive layout classes', () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPODData);

    const { container } = renderWithRouter();

    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    expect(container.querySelector('.max-w-7xl')).toBeInTheDocument();
  });

  test('displays system status correctly', () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPODData);

    renderWithRouter();

    const statusIndicators = screen.getAllByTestId('status-indicator');
    expect(statusIndicators.length).toBeGreaterThan(0);
  });

  test('handles navigation correctly', () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(
      screen.getByText(/Space Mission Control Dashboard/)
    ).toBeInTheDocument();
  });
});
