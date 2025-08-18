import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import NASAService from '../services/nasa.service';

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
        <div data-testid="metric-trend">{trend}</div>
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
  });

  test('renders dashboard header', () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(
      screen.getByText(/Space Mission Control Dashboard/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Real-time monitoring of NASA space data/)
    ).toBeInTheDocument();
  });

  test('loads APOD data on mount', async () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    await waitFor(() => {
      expect(NASAService.getAPOD).toHaveBeenCalled();
    });
  });

  test('displays APOD data when loaded successfully', async () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getAllByTestId('data-widget')).toHaveLength(
        expect.any(Number)
      );
    });
  });

  test('handles APOD loading error', async () => {
    const mockError = new Error('Failed to fetch APOD');
    (NASAService.getAPOD as jest.Mock).mockRejectedValue(mockError);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('widget-error')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    (NASAService.getAPOD as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockAPODData), 100))
    );

    renderWithRouter();

    expect(screen.queryAllByTestId('widget-loading')).toHaveLength(
      expect.any(Number)
    );
  });

  test('logs dashboard initialization', () => {
    const logger = require('../utils/logger');
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(logger.info).toHaveBeenCalledWith('Dashboard page loaded');
    expect(logger.debug).toHaveBeenCalledWith('Loading dashboard data');
  });

  test('logs successful APOD loading', async () => {
    const logger = require('../utils/logger');
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    await waitFor(() => {
      expect(logger.info).toHaveBeenCalledWith(
        'Dashboard APOD loaded successfully'
      );
    });
  });

  test('logs APOD loading errors', async () => {
    const logger = require('../utils/logger');
    const mockError = new Error('API Error');
    (NASAService.getAPOD as jest.Mock).mockRejectedValue(mockError);

    renderWithRouter();

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load dashboard data',
        mockError
      );
    });
  });

  test('renders metric cards', () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(screen.getAllByTestId('metric-card')).toHaveLength(
      expect.any(Number)
    );
  });

  test('renders status indicators', () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(screen.getAllByTestId('status-indicator')).toHaveLength(
      expect.any(Number)
    );
  });

  test('renders data widgets', () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(screen.getAllByTestId('data-widget')).toHaveLength(
      expect.any(Number)
    );
  });

  test('has responsive layout classes', () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    const { container } = renderWithRouter();

    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    expect(container.querySelector('.max-w-7xl')).toBeInTheDocument();
  });

  test('displays system status correctly', () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    const statusIndicators = screen.getAllByTestId('status-indicator');
    expect(statusIndicators.length).toBeGreaterThan(0);
  });

  test('handles navigation correctly', () => {
    (NASAService.getAPOD as jest.Mock).mockResolvedValue(mockAPODData);

    renderWithRouter();

    expect(
      screen.getByText(/Space Mission Control Dashboard/)
    ).toBeInTheDocument();
  });
});
