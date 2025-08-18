import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Favorites from './Favorites';

// Mock favorites service
jest.mock('../services/favorites.service');

// Mock components
jest.mock('../components/FavoriteButton', () => {
  return function MockFavoriteButton({
    item,
    onRemove,
  }: {
    item: any;
    onRemove?: () => void;
  }) {
    return (
      <button data-testid={`favorite-button-${item.id}`} onClick={onRemove}>
        Remove from Favorites
      </button>
    );
  };
});

jest.mock('../components/PhotoGallery', () => {
  return function MockPhotoGallery({ photos }: { photos: any[] }) {
    return (
      <div data-testid="photo-gallery">
        {photos.map((photo, index) => (
          <div key={index} data-testid={`photo-${index}`}>
            {photo.title || photo.img_src}
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

describe('Favorites', () => {
  const mockFavorites = [
    {
      id: '1',
      type: 'apod',
      title: 'Amazing Galaxy',
      url: 'https://example.com/galaxy.jpg',
      date: '2025-08-15',
      explanation: 'A beautiful galaxy image',
    },
    {
      id: '2',
      type: 'mars-photo',
      img_src: 'https://example.com/mars.jpg',
      earth_date: '2025-08-15',
      rover: { name: 'Curiosity' },
      camera: { name: 'FHAZ' },
    },
    {
      id: '3',
      type: 'neo',
      name: '(2020 BZ12)',
      is_potentially_hazardous_asteroid: false,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 0.1,
          estimated_diameter_max: 0.3,
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Favorites page title', () => {
    renderWithProviders(<Favorites />);

    expect(screen.getByText('My Favorites')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithProviders(<Favorites />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders favorites when data is loaded', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    });

    expect(screen.getByTestId('favorite-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-button-2')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-button-3')).toBeInTheDocument();
  });

  it('displays favorites count', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText(/3.*items/i)).toBeInTheDocument();
    });
  });

  it('handles empty favorites list', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue([]);

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText(/no favorites/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/start exploring/i)).toBeInTheDocument();
  });

  it('filters favorites by type', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    });

    // Find and click APOD filter
    const apodFilter = screen.getByRole('button', { name: /apod/i });
    await userEvent.click(apodFilter);

    // Should only show APOD items
    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    expect(screen.queryByText(/Curiosity/)).not.toBeInTheDocument();
  });

  it('handles removing favorites', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.removeFavorite.mockResolvedValue(undefined);

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByTestId('favorite-button-1')).toBeInTheDocument();
    });

    const removeButton = screen.getByTestId('favorite-button-1');
    await userEvent.click(removeButton);

    expect(favoritesService.removeFavorite).toHaveBeenCalledWith('1');
  });

  it('handles clearing all favorites', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.clearFavorites.mockResolvedValue(undefined);

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    await userEvent.click(clearButton);

    expect(favoritesService.clearFavorites).toHaveBeenCalled();
  });

  it('handles exporting favorites', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.exportFavorites.mockResolvedValue('exported-data');

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export/i });
    await userEvent.click(exportButton);

    expect(favoritesService.exportFavorites).toHaveBeenCalled();
  });

  it('shows error state when API fails', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('displays different favorite types correctly', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    });

    // APOD favorite
    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();

    // Mars photo favorite
    expect(screen.getByText(/Curiosity/)).toBeInTheDocument();

    // NEO favorite
    expect(screen.getByText('(2020 BZ12)')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    renderWithProviders(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search favorites/i);
    await userEvent.type(searchInput, 'galaxy');

    // Should filter to show only matching items
    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    expect(screen.queryByText(/Curiosity/)).not.toBeInTheDocument();
  });
});
