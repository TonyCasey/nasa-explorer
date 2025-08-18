import { useState, useEffect, useCallback } from 'react';
import favoritesService, { Favorite } from '../services/favorites.service';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    // Load initial favorites
    setFavorites(favoritesService.getFavorites());

    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      setFavorites(event.detail);
    };

    window.addEventListener('favoritesUpdated', handleUpdate as EventListener);
    return () => {
      // eslint-disable-next-line prettier/prettier
      window.removeEventListener(
        'favoritesUpdated',
        handleUpdate as EventListener
      );
    };
  }, []);

  const toggleFavorite = useCallback((favorite: Omit<Favorite, 'savedAt'>) => {
    return favoritesService.toggleFavorite(favorite);
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favoritesService.isFavorite(id);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    favoritesService.removeFavorite(id);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    totalCount: favorites.length,
  };
};
