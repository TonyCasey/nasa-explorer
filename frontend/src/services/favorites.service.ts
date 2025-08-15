import logger from '../utils/logger';

export interface Favorite {
  id: string;
  type: 'apod' | 'mars-photo' | 'neo';
  title: string;
  thumbnail?: string;
  data: any;
  savedAt: Date;
}

class FavoritesService {
  private readonly STORAGE_KEY = 'nasa-explorer-favorites';

  getFavorites(): Favorite[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const favorites = JSON.parse(stored);
      logger.debug('Retrieved favorites from storage', { count: favorites.length });
      return favorites;
    } catch (error) {
      logger.error('Failed to get favorites', error as Error);
      return [];
    }
  }

  addFavorite(favorite: Omit<Favorite, 'savedAt'>): void {
    try {
      const favorites = this.getFavorites();
      const newFavorite: Favorite = {
        ...favorite,
        savedAt: new Date(),
      };
      
      // Check if already exists
      const exists = favorites.some(f => f.id === favorite.id);
      if (exists) {
        logger.info('Item already in favorites', { id: favorite.id });
        return;
      }
      
      favorites.push(newFavorite);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      logger.info('Added to favorites', { id: favorite.id, type: favorite.type });
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: favorites }));
    } catch (error) {
      logger.error('Failed to add favorite', error as Error);
    }
  }

  removeFavorite(id: string): void {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(f => f.id !== id);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      logger.info('Removed from favorites', { id });
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: filtered }));
    } catch (error) {
      logger.error('Failed to remove favorite', error as Error);
    }
  }

  isFavorite(id: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(f => f.id === id);
  }

  toggleFavorite(favorite: Omit<Favorite, 'savedAt'>): boolean {
    if (this.isFavorite(favorite.id)) {
      this.removeFavorite(favorite.id);
      return false;
    } else {
      this.addFavorite(favorite);
      return true;
    }
  }

  clearFavorites(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      logger.info('Cleared all favorites');
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: [] }));
    } catch (error) {
      logger.error('Failed to clear favorites', error as Error);
    }
  }

  getFavoritesByType(type: 'apod' | 'mars-photo' | 'neo'): Favorite[] {
    return this.getFavorites().filter(f => f.type === type);
  }
}

export default new FavoritesService();