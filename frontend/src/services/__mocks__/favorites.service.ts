export interface Favorite {
  id: string;
  type: 'apod' | 'mars-photo' | 'neo';
  title: string;
  thumbnail?: string;
  data: any;
  savedAt: Date;
}

const mockFavoritesService = {
  getFavorites: jest.fn(() => []),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  toggleFavorite: jest.fn(),
  isFavorite: jest.fn(() => false),
  exportFavorites: jest.fn(),
  importFavorites: jest.fn(),
  clearAllFavorites: jest.fn(),
  getFavoritesByType: jest.fn(() => []),
};

export { Favorite };

export default mockFavoritesService;