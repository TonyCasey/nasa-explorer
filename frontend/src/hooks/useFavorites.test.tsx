import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFavorites } from './useFavorites';

// Mock favorites service
jest.mock('../services/favorites.service');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return TestWrapper;
};

describe('useFavorites', () => {
  const mockFavorites = [
    {
      id: '1',
      type: 'apod' as const,
      title: 'Amazing Galaxy',
      url: 'https://example.com/galaxy.jpg',
      date: '2025-08-15',
      data: {},
      savedAt: new Date(),
    },
    {
      id: '2',
      type: 'mars-photo' as const,
      title: 'Mars Photo',
      img_src: 'https://example.com/mars.jpg',
      earth_date: '2025-08-15',
      data: {},
      savedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns favorites data', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    expect(result.current.favorites).toEqual(mockFavorites);
    expect(result.current.totalCount).toBe(2);
  });

  it('handles empty favorites list', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue([]);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('toggles favorite', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue([]);
    favoritesService.toggleFavorite.mockReturnValue(true);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    const newFavorite = {
      id: '3',
      type: 'neo' as const,
      title: 'Asteroid',
      data: {},
    };

    await act(async () => {
      const toggled = result.current.toggleFavorite(newFavorite);
      expect(toggled).toBe(true);
    });

    expect(favoritesService.toggleFavorite).toHaveBeenCalledWith(newFavorite);
  });

  it('removes favorite', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.removeFavorite('1');
    });

    expect(favoritesService.removeFavorite).toHaveBeenCalledWith('1');
  });

  it('checks if item is favorite', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);
    favoritesService.isFavorite.mockReturnValue(true);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    const isFav = result.current.isFavorite('1');
    expect(isFav).toBe(true);
    expect(favoritesService.isFavorite).toHaveBeenCalledWith('1');
  });

  it('updates favorites when favoritesUpdated event is dispatched', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue(mockFavorites);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    const updatedFavorites = [mockFavorites[0]];

    act(() => {
      const event = new CustomEvent('favoritesUpdated', {
        detail: updatedFavorites,
      });
      window.dispatchEvent(event);
    });

    expect(result.current.favorites).toEqual(updatedFavorites);
    expect(result.current.totalCount).toBe(1);
  });

  it('cleans up event listener on unmount', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const favoritesService = require('../services/favorites.service').default;
    favoritesService.getFavorites.mockReturnValue([]);

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useFavorites(), {
      wrapper: createWrapper(),
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'favoritesUpdated',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
