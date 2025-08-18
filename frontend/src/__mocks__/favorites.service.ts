// Mock for favorites service
const favoritesService = {
  getFavorites: jest.fn(),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  isFavorite: jest.fn(),
  toggleFavorite: jest.fn(),
  clearFavorites: jest.fn(),
  getFavoritesByType: jest.fn(),
};

export default favoritesService;