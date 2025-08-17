import favoritesService, { Favorite } from './favorites.service';

describe('FavoritesService', () => {
  const mockFavorite: Omit<Favorite, 'savedAt'> = {
    id: 'test-1',
    type: 'apod',
    title: 'Test APOD',
    thumbnail: 'https://test.com/image.jpg',
    data: { test: 'data' },
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear any custom event listeners
    jest.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('returns empty array when no favorites exist', () => {
      const favorites = favoritesService.getFavorites();
      expect(favorites).toEqual([]);
    });

    it('returns stored favorites', () => {
      const testFavorites = [{ ...mockFavorite, savedAt: new Date() }];
      localStorage.setItem(
        'nasa-explorer-favorites',
        JSON.stringify(testFavorites)
      );

      const favorites = favoritesService.getFavorites();
      expect(favorites).toHaveLength(1);
      expect(favorites[0].id).toBe('test-1');
    });

    it('handles corrupted localStorage data', () => {
      localStorage.setItem('nasa-explorer-favorites', 'invalid json');

      const favorites = favoritesService.getFavorites();
      expect(favorites).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('adds a new favorite to storage', () => {
      favoritesService.addFavorite(mockFavorite);

      const favorites = favoritesService.getFavorites();
      expect(favorites).toHaveLength(1);
      expect(favorites[0].id).toBe('test-1');
      expect(favorites[0].savedAt).toBeDefined();
    });

    it('does not add duplicate favorites', () => {
      favoritesService.addFavorite(mockFavorite);
      favoritesService.addFavorite(mockFavorite);

      const favorites = favoritesService.getFavorites();
      expect(favorites).toHaveLength(1);
    });

    it('dispatches favoritesUpdated event', () => {
      const mockEventListener = jest.fn();
      window.addEventListener('favoritesUpdated', mockEventListener);

      favoritesService.addFavorite(mockFavorite);

      expect(mockEventListener).toHaveBeenCalled();
      window.removeEventListener('favoritesUpdated', mockEventListener);
    });
  });

  describe('removeFavorite', () => {
    it('removes a favorite from storage', () => {
      favoritesService.addFavorite(mockFavorite);
      expect(favoritesService.getFavorites()).toHaveLength(1);

      favoritesService.removeFavorite('test-1');
      expect(favoritesService.getFavorites()).toHaveLength(0);
    });

    it('handles removing non-existent favorite', () => {
      favoritesService.removeFavorite('non-existent');
      expect(favoritesService.getFavorites()).toHaveLength(0);
    });
  });

  describe('isFavorite', () => {
    it('returns true for existing favorite', () => {
      favoritesService.addFavorite(mockFavorite);
      expect(favoritesService.isFavorite('test-1')).toBe(true);
    });

    it('returns false for non-existent favorite', () => {
      expect(favoritesService.isFavorite('non-existent')).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('adds favorite if not exists', () => {
      const result = favoritesService.toggleFavorite(mockFavorite);
      expect(result).toBe(true);
      expect(favoritesService.isFavorite('test-1')).toBe(true);
    });

    it('removes favorite if exists', () => {
      favoritesService.addFavorite(mockFavorite);
      const result = favoritesService.toggleFavorite(mockFavorite);
      expect(result).toBe(false);
      expect(favoritesService.isFavorite('test-1')).toBe(false);
    });
  });

  describe('clearFavorites', () => {
    it('removes all favorites', () => {
      favoritesService.addFavorite(mockFavorite);
      favoritesService.addFavorite({ ...mockFavorite, id: 'test-2' });
      expect(favoritesService.getFavorites()).toHaveLength(2);

      favoritesService.clearFavorites();
      expect(favoritesService.getFavorites()).toHaveLength(0);
    });
  });

  describe('getFavoritesByType', () => {
    it('filters favorites by type', () => {
      favoritesService.addFavorite(mockFavorite);
      favoritesService.addFavorite({
        ...mockFavorite,
        id: 'test-2',
        type: 'mars-photo',
      });

      const apodFavorites = favoritesService.getFavoritesByType('apod');
      expect(apodFavorites).toHaveLength(1);
      expect(apodFavorites[0].type).toBe('apod');

      const marsFavorites = favoritesService.getFavoritesByType('mars-photo');
      expect(marsFavorites).toHaveLength(1);
      expect(marsFavorites[0].type).toBe('mars-photo');
    });
  });
});
