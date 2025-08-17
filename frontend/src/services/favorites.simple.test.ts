import favoritesService from './favorites.service';

describe('Favorites Service - Simple Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should initialize with empty favorites', () => {
    const favorites = favoritesService.getFavorites();
    expect(favorites).toEqual([]);
  });

  it('should add a favorite', () => {
    const favorite = {
      id: '1',
      type: 'apod',
      title: 'Test Image',
      url: 'https://example.com/image.jpg',
      date: '2025-08-15',
    };

    favoritesService.addFavorite(favorite);
    const favorites = favoritesService.getFavorites();

    expect(favorites).toHaveLength(1);
    expect(favorites[0]).toMatchObject(favorite);
    expect(favorites[0].savedAt).toBeDefined();
  });

  it('should remove a favorite', () => {
    const favorite = {
      id: '1',
      type: 'apod',
      title: 'Test Image',
      url: 'https://example.com/image.jpg',
      date: '2025-08-15',
    };

    favoritesService.addFavorite(favorite);
    expect(favoritesService.getFavorites()).toHaveLength(1);

    favoritesService.removeFavorite('1');
    expect(favoritesService.getFavorites()).toHaveLength(0);
  });

  it('should check if item is favorite', () => {
    const favorite = {
      id: '1',
      type: 'apod',
      title: 'Test Image',
      url: 'https://example.com/image.jpg',
      date: '2025-08-15',
    };

    expect(favoritesService.isFavorite('1')).toBe(false);

    favoritesService.addFavorite(favorite);
    expect(favoritesService.isFavorite('1')).toBe(true);
  });

  it('should clear all favorites', () => {
    const favorite1 = {
      id: '1',
      type: 'apod',
      title: 'Test Image 1',
      url: 'https://example.com/image1.jpg',
      date: '2025-08-15',
    };
    const favorite2 = {
      id: '2',
      type: 'apod',
      title: 'Test Image 2',
      url: 'https://example.com/image2.jpg',
      date: '2025-08-16',
    };

    favoritesService.addFavorite(favorite1);
    favoritesService.addFavorite(favorite2);
    expect(favoritesService.getFavorites()).toHaveLength(2);

    favoritesService.clearFavorites();
    expect(favoritesService.getFavorites()).toHaveLength(0);
  });
});
