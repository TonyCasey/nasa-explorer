import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NEOTracker from './NEOTracker';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Mock NASA service
jest.mock('../services/nasa.service', () => ({
  nasaService: {
    getNEOFeed: jest.fn(),
  },
}));

// Mock components
jest.mock('../components/DatePicker', () => {
  return function MockDatePicker({
    value,
    onChange,
  }: {
    value: string;
    onChange: (date: string) => void;
  }) {
    return (
      <input
        data-testid="date-picker"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

jest.mock('../components/NEOCard', () => {
  return function MockNEOCard({ neo }: { neo: any }) {
    return (
      <div data-testid={`neo-card-${neo.id}`}>
        {neo.name} -{' '}
        {neo.is_potentially_hazardous_asteroid ? 'Hazardous' : 'Safe'}
      </div>
    );
  };
});

jest.mock('../components/NEOChart', () => {
  return function MockNEOChart({ data }: { data: any[] }) {
    return (
      <div data-testid="neo-chart">Chart with {data.length} data points</div>
    );
  };
});

jest.mock('../components/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock('../components/ErrorBoundary', () => {
  return function MockErrorBoundary({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('NEOTracker', () => {
  const mockNEOData = {
    element_count: 2,
    near_earth_objects: {
      '2025-08-15': [
        {
          id: '1',
          name: '(2020 BZ12)',
          estimated_diameter: {
            kilometers: {
              estimated_diameter_min: 0.1,
              estimated_diameter_max: 0.3,
            },
          },
          is_potentially_hazardous_asteroid: false,
          close_approach_data: [
            {
              close_approach_date: '2025-08-15',
              relative_velocity: {
                kilometers_per_hour: '25000',
              },
              miss_distance: {
                kilometers: '1000000',
              },
            },
          ],
        },
        {
          id: '2',
          name: '(2021 AC5)',
          estimated_diameter: {
            kilometers: {
              estimated_diameter_min: 0.5,
              estimated_diameter_max: 1.2,
            },
          },
          is_potentially_hazardous_asteroid: true,
          close_approach_data: [
            {
              close_approach_date: '2025-08-15',
              relative_velocity: {
                kilometers_per_hour: '30000',
              },
              miss_distance: {
                kilometers: '500000',
              },
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders NEO Tracker page title', () => {
    renderWithProviders(<NEOTracker />);

    expect(screen.getByText('Near Earth Objects Tracker')).toBeInTheDocument();
  });

  it('renders date picker for date range selection', () => {
    renderWithProviders(<NEOTracker />);

    const datePickers = screen.getAllByTestId('date-picker');
    expect(datePickers).toHaveLength(2); // Start and end date
  });

  it('shows loading state initially', () => {
    renderWithProviders(<NEOTracker />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders NEO cards when data is loaded', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    await waitFor(() => {
      expect(screen.getByTestId('neo-card-1')).toBeInTheDocument();
    });

    expect(screen.getByTestId('neo-card-2')).toBeInTheDocument();
    expect(screen.getByText('(2020 BZ12) - Safe')).toBeInTheDocument();
    expect(screen.getByText('(2021 AC5) - Hazardous')).toBeInTheDocument();
  });

  it('renders NEO chart when data is loaded', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    await waitFor(() => {
      expect(screen.getByTestId('neo-chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Chart with 2 data points')).toBeInTheDocument();
  });

  it('displays summary statistics', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    await waitFor(() => {
      expect(screen.getByText(/2.*objects/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/1.*hazardous/i)).toBeInTheDocument();
  });

  it('handles date range changes', async () => {
    const user = userEvent.setup();
    const { nasaService } = require('../services/nasa.service');
    nasaService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    const datePickers = screen.getAllByTestId('date-picker');
    const startDatePicker = datePickers[0];

    await user.clear(startDatePicker);
    await user.type(startDatePicker, '2025-08-14');

    expect(nasaService.getNEOFeed).toHaveBeenCalledWith(
      '2025-08-14',
      expect.any(String)
    );
  });

  it('shows error state when API fails', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getNEOFeed.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<NEOTracker />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('handles empty NEO results', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getNEOFeed.mockResolvedValue({
      element_count: 0,
      near_earth_objects: {},
    });

    renderWithProviders(<NEOTracker />);

    await waitFor(() => {
      expect(screen.getByText(/0.*objects/i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('neo-card-1')).not.toBeInTheDocument();
  });

  it('filters hazardous objects correctly', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    await waitFor(() => {
      expect(screen.getByText(/1.*hazardous/i)).toBeInTheDocument();
    });

    // Should show both safe and hazardous objects
    expect(screen.getByText('(2020 BZ12) - Safe')).toBeInTheDocument();
    expect(screen.getByText('(2021 AC5) - Hazardous')).toBeInTheDocument();
  });

  it('displays today as default date range', () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    expect(nasaService.getNEOFeed).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
    );
  });
});
