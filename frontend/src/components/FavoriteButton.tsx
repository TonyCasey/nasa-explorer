import React, { useState, useEffect } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { Favorite } from '../services/favorites.service';

interface FavoriteButtonProps {
  item: Omit<Favorite, 'savedAt'>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  item,
  className = '',
  size = 'md',
}) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(item.id));
  }, [item.id, isFavorite]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsAnimating(true);
    const newState = toggleFavorite(item);
    setIsFav(newState);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <button
      onClick={handleClick}
      className={`relative transition-transform duration-200 hover:scale-110 ${
        isAnimating ? 'animate-pulse' : ''
      } ${className}`}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`${sizeClasses[size]} transition-all duration-200`}
        fill={isFav ? '#F59E0B' : 'none'}
        stroke={isFav ? '#F59E0B' : 'currentColor'}
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      {isAnimating && (
        <span className="absolute inset-0 rounded-full bg-solar-orange/20 animate-ping" />
      )}
    </button>
  );
};

export default FavoriteButton;