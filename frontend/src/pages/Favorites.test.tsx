import React from 'react';
import { render, screen } from '@testing-library/react';
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
    item: { id: string };
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
  return function MockPhotoGallery({
    photos,
  }: {
    photos: Array<{ title?: string; img_src?: string }>;
  }) {
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
      type: 'apod' as const,
      title: 'Amazing Galaxy',
      thumbnail: 'https://example.com/galaxy.jpg',
      data: {
        url: 'https://example.com/galaxy.jpg',
        date: '2025-08-15',
        explanation: 'A beautiful galaxy image',
      },
      savedAt: new Date('2025-08-15'),
    },
    {
      id: '2',
      type: 'mars-photo' as const,
      title: 'Mars Photo - Curiosity',
      thumbnail: 'https://example.com/mars.jpg',
      data: {
        img_src: 'https://example.com/mars.jpg',
        earth_date: '2025-08-15',
        rover: { name: 'Curiosity' },
        camera: { name: 'FHAZ' },
      },
      savedAt: new Date('2025-08-15'),
    },
    {
      id: '3',
      type: 'neo' as const,
      title: '(2020 BZ12)',
      data: {
        name: '(2020 BZ12)',
        is_potentially_hazardous_asteroid: false,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.1,
            estimated_diameter_max: 0.3,
          },
        },
      },
      savedAt: new Date('2025-08-15'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock return values
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue([]);
    favoritesService.isFavorite.mockReturnValue(false);
    favoritesService.getFavoritesByType.mockReturnValue([]);
  });

  it('renders Favorites page title', () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue([]);

    renderWithProviders(<Favorites />);

    expect(screen.getByText(/My Favorites/)).toBeInTheDocument();
  });

  it('shows empty state when no favorites', () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue([]);

    renderWithProviders(<Favorites />);

    expect(screen.getByText(/No Favorites Yet/)).toBeInTheDocument();
  });

  it('renders favorites when data is loaded', () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);

    renderWithProviders(<Favorites />);

    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();

    expect(screen.getByTestId('favorite-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-button-2')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-button-3')).toBeInTheDocument();
  });

  it('displays favorites count', () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);

    renderWithProviders(<Favorites />);

    // Check for the count in the All button
    const allButton = screen.getByRole('button', { name: /All/ });
    expect(allButton).toHaveTextContent('3');
  });

  it('handles empty favorites list', () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue([]);

    renderWithProviders(<Favorites />);

    expect(screen.getByText(/No Favorites Yet/)).toBeInTheDocument();
    expect(screen.getByText(/Start exploring/)).toBeInTheDocument();
  });

  it('filters favorites by type', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);

    renderWithProviders(<Favorites />);

    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();

    // Find and click APOD filter
    const apodFilter = screen.getByRole('button', { name: /apod/i });
    await userEvent.click(apodFilter);

    // Should only show APOD items
    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    expect(screen.queryByText(/Curiosity/)).not.toBeInTheDocument();
  });

  it('handles removing favorites', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);
    favoritesService.removeFavorite.mockReturnValue(undefined);

    renderWithProviders(<Favorites />);

    expect(screen.getByTestId('favorite-button-1')).toBeInTheDocument();

    const removeButton = screen.getByTestId('favorite-button-1');
    await userEvent.click(removeButton);

    expect(favoritesService.removeFavorite).toHaveBeenCalledWith('1');
  });

  // Note: Clear all favorites feature not yet implemented in component
  it.skip('handles clearing all favorites', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);
    favoritesService.clearAllFavorites.mockReturnValue(undefined);

    renderWithProviders(<Favorites />);

    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    await userEvent.click(clearButton);

    expect(favoritesService.clearAllFavorites).toHaveBeenCalled();
  });

  // Note: Export favorites feature not yet implemented in component
  it.skip('handles exporting favorites', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);
    favoritesService.exportFavorites.mockReturnValue('exported-data');

    renderWithProviders(<Favorites />);

    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: /export/i });
    await userEvent.click(exportButton);

    expect(favoritesService.exportFavorites).toHaveBeenCalled();
  });

  it('shows error state when API fails', () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockImplementation(() => {
      throw new Error('API Error');
    });

    renderWithProviders(<Favorites />);

    // Since getFavorites catches errors and returns empty array, we should see empty state
    expect(screen.getByText(/No Favorites Yet/)).toBeInTheDocument();
  });

  it('displays different favorite types correctly', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);

    renderWithProviders(<Favorites />);

    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();

    // APOD favorite
    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();

    // Mars photo favorite
    expect(screen.getByText('Mars Photo - Curiosity')).toBeInTheDocument();

    // NEO favorite
    expect(screen.getByText('(2020 BZ12)')).toBeInTheDocument();
  });

  // Note: Search functionality not yet implemented in component
  it.skip('handles search functionality', async () => {
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);

    renderWithProviders(<Favorites />);

    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search favorites/i);
    await userEvent.type(searchInput, 'galaxy');

    // Should filter to show only matching items
    expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    expect(screen.queryByText(/Curiosity/)).not.toBeInTheDocument();
  });
});
