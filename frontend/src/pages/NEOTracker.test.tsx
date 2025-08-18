import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NEOTracker from './NEOTracker';

// Mock NASA service
jest.mock('../services/nasa.service');

// Mock components
jest.mock('../components/DatePicker', () => {
  return function MockDatePicker({
    selectedDate,
    onDateChange,
  }: {
    selectedDate: string;
    onDateChange: (date: string) => void;
  }) {
    return (
      <input
        data-testid="date-picker"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
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
  return function MockNEOChart({ neos }: { neos: any[] }) {
    const dataLength = neos ? neos.length : 0;
    return (
      <div data-testid="neo-chart">Chart with {dataLength} data points</div>
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
    // Setup default mock return value
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockResolvedValue(mockNEOData);
  });

  it('renders NEO Tracker page title', () => {
    renderWithProviders(<NEOTracker />);

    expect(
      screen.getByText('☄️ Near Earth Objects Tracker')
    ).toBeInTheDocument();
  });

  it('renders date picker for date range selection', () => {
    renderWithProviders(<NEOTracker />);

    // NEOTracker might use a single date picker with range functionality
    const datePickers = screen.getAllByTestId('date-picker');
    expect(datePickers.length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading state initially', () => {
    // Mock a pending promise to keep loading state
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<NEOTracker />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders NEO cards when data is loaded', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    await waitFor(
      () => {
        expect(screen.getAllByTestId('neo-card-1')).toHaveLength(1);
      },
      { timeout: 3000 }
    );

    expect(screen.getAllByTestId('neo-card-2')).toHaveLength(2); // Card appears in both hazardous and upcoming sections
    expect(screen.getByText('(2020 BZ12) - Safe')).toBeInTheDocument();
    expect(screen.getAllByText('(2021 AC5) - Hazardous')).toHaveLength(2);
  });

  it('renders NEO chart when data is loaded', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    await waitFor(
      () => {
        expect(screen.getByTestId('neo-chart')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Chart with 2 data points')).toBeInTheDocument();
  });

  it('displays summary statistics', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    await waitFor(
      () => {
        expect(screen.getByText(/Objects tracked:/)).toBeInTheDocument();
        expect(
          screen.getByText('2', { selector: 'span.text-white.font-medium' })
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(
      screen.getByText('1 potentially hazardous objects')
    ).toBeInTheDocument();
  });

  it('handles date range changes', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    const datePickers = screen.getAllByTestId('date-picker');
    const startDatePicker = datePickers[0];

    await userEvent.clear(startDatePicker);
    await userEvent.type(startDatePicker, '2025-08-14');

    await waitFor(
      () => {
        expect(NASAService.getNEOFeed).toHaveBeenCalledWith({
          startDate: '2025-08-14',
          endDate: expect.any(String),
        });
      },
      { timeout: 3000 }
    );
  });

  it('shows error state when API fails', async () => {
    // Suppress console errors for this test
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<NEOTracker />);

    await waitFor(
      () => {
        expect(
          screen.getByText(/Failed to load NEO tracking data/i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    consoleSpy.mockRestore();
  });

  it('handles empty NEO results', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockResolvedValue({
      element_count: 0,
      near_earth_objects: {},
    });

    renderWithProviders(<NEOTracker />);

    await waitFor(
      () => {
        expect(screen.getByText(/Objects tracked:/)).toBeInTheDocument();
        expect(
          screen.getByText('0', { selector: 'span.text-white.font-medium' })
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.queryByTestId('neo-card-1')).not.toBeInTheDocument();
  });

  it('filters hazardous objects correctly', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    await waitFor(
      () => {
        expect(
          screen.getByText('1 potentially hazardous objects')
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should show both safe and hazardous objects
    expect(screen.getByText('(2020 BZ12) - Safe')).toBeInTheDocument();
    expect(screen.getAllByText('(2021 AC5) - Hazardous')).toHaveLength(2);
  });

  it('displays today as default date range', () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getNEOFeed.mockResolvedValue(mockNEOData);

    renderWithProviders(<NEOTracker />);

    expect(NASAService.getNEOFeed).toHaveBeenCalledWith({
      startDate: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
      endDate: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
    });
  });
});
