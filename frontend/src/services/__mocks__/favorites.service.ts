export interface Favorite {
  id: string;
  type: 'apod' | 'mars-photo' | 'neo';
  title: string;
  thumbnail?: string;
  data: Record<string, unknown>;
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

export default mockFavoritesService;
