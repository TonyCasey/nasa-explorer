import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MarsRovers from './MarsRovers';
import NASAService from '../services/nasa.service';

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock NASA service
jest.mock('../services/nasa.service', () => ({
  default: {
    getMarsRoverPhotos: jest.fn(),
    getRoverInfo: jest.fn(),
  },
}));

// Mock components
jest.mock('../components/RoverFilters', () => {
  return function MockRoverFilters({
    onFilterChange,
  }: {
    onFilterChange: (filters: any) => void;
  }) {
    return (
      <div data-testid="rover-filters">
        <button onClick={() => onFilterChange({ rover: 'curiosity' })}>
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
  });

  it('renders Mars Rovers page title', () => {
    renderWithProviders(<MarsRovers />);

    expect(screen.getByText('Mars Rover Photos')).toBeInTheDocument();
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
    const { nasaService } = require('../services/nasa.service');
    nasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    nasaService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    await waitFor(() => {
      expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
    });

    expect(screen.getByTestId('photo-0')).toBeInTheDocument();
    expect(screen.getByTestId('photo-1')).toBeInTheDocument();
  });

  it('handles filter changes', async () => {
    const user = userEvent.setup();
    const { nasaService } = require('../services/nasa.service');
    nasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    nasaService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    const applyFiltersButton = screen.getByText('Apply Filters');
    await user.click(applyFiltersButton);

    expect(nasaService.getMarsRoverPhotos).toHaveBeenCalledWith(
      expect.objectContaining({ rover: 'curiosity' })
    );
  });

  it('displays rover information', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    nasaService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    await waitFor(() => {
      expect(screen.getByText(/Curiosity/)).toBeInTheDocument();
    });

    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getMarsRoverPhotos.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<MarsRovers />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('handles empty photo results', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getMarsRoverPhotos.mockResolvedValue({ photos: [] });
    nasaService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    await waitFor(() => {
      expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('photo-0')).not.toBeInTheDocument();
  });

  it('displays photo count when photos are loaded', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);
    nasaService.getRoverInfo.mockResolvedValue(mockRoverInfo);

    renderWithProviders(<MarsRovers />);

    await waitFor(() => {
      expect(screen.getByText(/2.*photos/i)).toBeInTheDocument();
    });
  });
});
