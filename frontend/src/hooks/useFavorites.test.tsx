import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFavorites } from './useFavorites';

// Mock favorites service
jest.mock('../services/favorites.service', () => ({
  favoritesService: {
    getFavorites: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    clearFavorites: jest.fn(),
    isFavorite: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  return TestWrapper;
};

describe('useFavorites', () => {
  const mockFavorites = [
    {
      id: '1',
      type: 'apod',
      title: 'Amazing Galaxy',
      url: 'https://example.com/galaxy.jpg',
      date: '2025-08-15',
    },
    {
      id: '2',
      type: 'mars-photo',
      img_src: 'https://example.com/mars.jpg',
      earth_date: '2025-08-15',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns favorites data', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoading).toBe(true);

    // Wait for the query to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.favorites).toEqual(mockFavorites);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles loading state', () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.favorites).toEqual([]);
  });

  it('handles error state', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it('adds favorite successfully', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.addFavorite.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    const newFavorite = {
      id: '3',
      type: 'neo',
      name: '(2020 BZ12)',
    };

    await act(async () => {
      await result.current.addFavorite(newFavorite);
    });

    expect(favoritesService.addFavorite).toHaveBeenCalledWith(newFavorite);
  });

  it('removes favorite successfully', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.removeFavorite.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.removeFavorite('1');
    });

    expect(favoritesService.removeFavorite).toHaveBeenCalledWith('1');
  });

  it('clears all favorites successfully', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.clearFavorites.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.clearFavorites();
    });

    expect(favoritesService.clearFavorites).toHaveBeenCalled();
  });

  it('checks if item is favorite', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.isFavorite.mockReturnValue(true);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    const isFav = result.current.isFavorite('1');
    expect(isFav).toBe(true);
    expect(favoritesService.isFavorite).toHaveBeenCalledWith('1');
  });

  it('returns correct favorites count', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.favoritesCount).toBe(2);
  });

  it('returns zero count when no favorites', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue([]);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.favoritesCount).toBe(0);
  });

  it('handles add favorite error', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.addFavorite.mockRejectedValue(new Error('Add failed'));

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    const newFavorite = { id: '3', type: 'neo', name: '(2020 BZ12)' };

    await act(async () => {
      try {
        await result.current.addFavorite(newFavorite);
      } catch (error) {
        expect(error.message).toBe('Add failed');
      }
    });
  });

  it('handles remove favorite error', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.removeFavorite.mockRejectedValue(new Error('Remove failed'));

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.removeFavorite('1');
      } catch (error) {
        expect(error.message).toBe('Remove failed');
      }
    });
  });

  it('refetches data after mutations', async () => {
    const { favoritesService } = require('../services/favorites.service');
    favoritesService.getFavorites.mockResolvedValue(mockFavorites);
    favoritesService.addFavorite.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(favoritesService.getFavorites).toHaveBeenCalledTimes(1);

    // Add a favorite
    await act(async () => {
      await result.current.addFavorite({ id: '3', type: 'neo' });
    });

    // Should refetch after mutation
    expect(favoritesService.getFavorites).toHaveBeenCalledTimes(2);
  });
});