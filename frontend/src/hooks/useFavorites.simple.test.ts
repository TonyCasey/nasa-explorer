import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './useFavorites';

describe('useFavorites Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());
    
    expect(result.current.favorites).toEqual([]);
    expect(result.current.favorites.length).toBe(0);
  });

  it('should add a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    const testItem = {
      id: '1',
      title: 'Test Item',
      url: 'https://example.com/test.jpg',
      type: 'apod' as const
    };

    act(() => {
      result.current.addFavorite(testItem);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]).toEqual(testItem);
  });

  it('should remove a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    const testItem = {
      id: '1',
      title: 'Test Item',
      url: 'https://example.com/test.jpg',
      type: 'apod' as const
    };

    act(() => {
      result.current.addFavorite(testItem);
    });

    act(() => {
      result.current.removeFavorite('1');
    });

    expect(result.current.favorites).toHaveLength(0);
  });

  it('should check if item is favorite', () => {
    const { result } = renderHook(() => useFavorites());
    const testItem = {
      id: '1',
      title: 'Test Item',
      url: 'https://example.com/test.jpg',
      type: 'apod' as const
    };

    expect(result.current.isFavorite('1')).toBe(false);

    act(() => {
      result.current.addFavorite(testItem);
    });

    expect(result.current.isFavorite('1')).toBe(true);
  });

  it('should toggle favorite status', () => {
    const { result } = renderHook(() => useFavorites());
    const testItem = {
      id: '1',
      title: 'Test Item',
      url: 'https://example.com/test.jpg',
      type: 'apod' as const
    };

    expect(result.current.isFavorite('1')).toBe(false);

    act(() => {
      result.current.toggleFavorite(testItem);
    });

    expect(result.current.isFavorite('1')).toBe(true);

    act(() => {
      result.current.toggleFavorite(testItem);
    });

    expect(result.current.isFavorite('1')).toBe(false);
  });

  it('should clear all favorites', () => {
    const { result } = renderHook(() => useFavorites());
    const testItems = [
      { id: '1', title: 'Item 1', url: 'url1', type: 'apod' as const },
      { id: '2', title: 'Item 2', url: 'url2', type: 'mars' as const }
    ];

    act(() => {
      testItems.forEach(item => result.current.addFavorite(item));
    });

    expect(result.current.favorites).toHaveLength(2);

    act(() => {
      result.current.clearFavorites();
    });

    expect(result.current.favorites).toHaveLength(0);
  });

  it('should persist favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    const testItem = {
      id: '1',
      title: 'Test Item',
      url: 'https://example.com/test.jpg',
      type: 'apod' as const
    };

    act(() => {
      result.current.addFavorite(testItem);
    });

    const stored = localStorage.getItem('nasa-explorer-favorites');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toHaveLength(1);
  });
});