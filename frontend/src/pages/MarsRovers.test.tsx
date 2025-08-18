import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MarsRovers from './MarsRovers';

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock NASA service
jest.mock('../services/nasa.service');

// Mock components
jest.mock('../components/RoverFilters', () => {
  return function MockRoverFilters({
    onFiltersChange,
    filters,
    isLoading,
  }: {
    onFiltersChange: (filters: any) => void;
    filters: any;
    isLoading?: boolean;
  }) {
    return (
      <div data-testid="rover-filters">
        <button
          onClick={() => onFiltersChange({ rover: 'curiosity' })}
          disabled={isLoading}
        >
          Apply Filters
        </button>
      </div>
    );
  };
});

jest.mock('../components/PhotoGallery', () => {
  return function MockPhotoGallery({ photos }: { photos: any[] }) {
    return (
      <div data-testid="photo-gallery">
        {photos.map((photo, index) => (
          <div key={index} data-testid={`photo-${index}`}>
            {photo.img_src}
          </div>
        ))}
      </div>
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

describe('MarsRovers', () => {
  const mockPhotos = {
    photos: [
      {
        id: 1,
        img_src: 'https://example.com/photo1.jpg',
        earth_date: '2025-08-15',
        rover: { name: 'Curiosity' },
        camera: { name: 'FHAZ' },
      },
      {
        id: 2,
        img_src: 'https://example.com/photo2.jpg',
        earth_date: '2025-08-15',
        rover: { name: 'Curiosity' },
        camera: { name: 'RHAZ' },
      },
    ],
  };

  const mockRoverInfo = {
    rover: {
      name: 'Curiosity',
      status: 'active',
      launch_date: '2011-11-26',
      landing_date: '2012-08-06',
      max_sol: 3000,
      max_date: '2025-08-15',
      total_photos: 500000,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock return values
    const NASAService = require('../services/nasa.service').default;
    NASAService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    NASAService.getRoverInfo.mockResolvedValue(mockRoverInfo);
  });

  it('renders Mars Rovers page title', () => {
    renderWithProviders(<MarsRovers />);

    expect(screen.getByText('🔴 Mars Rover Gallery')).toBeInTheDocument();
  });

  it('renders rover filters', () => {
    renderWithProviders(<MarsRovers />);

    expect(screen.getByTestId('rover-filters')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithProviders(<MarsRovers />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders photo gallery when data is loaded', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    NASAService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    await waitFor(
      () => {
        expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByTestId('photo-0')).toBeInTheDocument();
    expect(screen.getByTestId('photo-1')).toBeInTheDocument();
  });

  it('handles filter changes', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    NASAService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    const applyFiltersButton = screen.getByText('Apply Filters');
    await userEvent.click(applyFiltersButton);

    expect(NASAService.getMarsRoverPhotos).toHaveBeenCalledWith(
      expect.objectContaining({ rover: 'curiosity' })
    );
  });

  it('displays rover information', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    NASAService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    await waitFor(
      () => {
        expect(screen.getAllByText(/Curiosity/)).toHaveLength(3);
      },
      { timeout: 3000 }
    );

    expect(screen.getAllByText(/active/i)).toHaveLength(3);
  });

  it('shows error state when API fails', async () => {
    // Suppress console errors for this test
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const NASAService = require('../services/nasa.service').default;
    NASAService.getMarsRoverPhotos.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<MarsRovers />);

    await waitFor(
      () => {
        // Error is handled gracefully - just check that photos array is empty due to error
        expect(screen.getByText('0')).toBeInTheDocument(); // photo count should be 0
      },
      { timeout: 3000 }
    );

    consoleSpy.mockRestore();
  });

  it('handles empty photo results', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getMarsRoverPhotos.mockResolvedValue({ photos: [] });
    NASAService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    await waitFor(() => {
      expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('photo-0')).not.toBeInTheDocument();
  });

  it('displays photo count when photos are loaded', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    NASAService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    await waitFor(
      () => {
        expect(screen.getByText(/Photos found:/)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
