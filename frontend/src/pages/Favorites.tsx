import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import FavoriteButton from '../components/FavoriteButton';
import logger from '../utils/logger';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [filter, setFilter] = useState<'all' | 'apod' | 'mars-photo' | 'neo'>('all');

  React.useEffect(() => {
    logger.info('Favorites page loaded', { count: favorites.length });
  }, [favorites.length]);

  const filteredFavorites = filter === 'all' 
    ? favorites 
    : favorites.filter(f => f.type === filter);

  const handleItemClick = (favorite: any) => {
    switch (favorite.type) {
      case 'apod':
        navigate('/apod');
        break;
      case 'mars-photo':
        navigate('/mars-rovers');
        break;
      case 'neo':
        navigate('/neo-tracker');
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'apod':
        return '🌌';
      case 'mars-photo':
        return '🔴';
      case 'neo':
        return '☄️';
      default:
        return '⭐';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apod':
        return 'Astronomy Picture';
      case 'mars-photo':
        return 'Mars Photo';
      case 'neo':
        return 'Near Earth Object';
      default:
        return 'Space Item';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-inter font-bold text-gradient">
            ⭐ My Favorites
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Your personal collection of saved space discoveries
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="glass-effect rounded-xl p-2 inline-flex mx-auto">
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All', icon: '✨' },
              { value: 'apod', label: 'APOD', icon: '🌌' },
              { value: 'mars-photo', label: 'Mars', icon: '🔴' },
              { value: 'neo', label: 'NEO', icon: '☄️' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  filter === tab.value
                    ? 'bg-cosmic-purple text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.value === 'all' && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="glass-effect rounded-xl p-12 text-center">
            <span className="text-6xl mb-4 block">🌠</span>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Favorites Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start exploring and save your favorite space discoveries!
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => navigate('/apod')}
                className="bg-cosmic-purple hover:bg-cosmic-purple/80 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Explore APOD
              </button>
              <button
                onClick={() => navigate('/mars-rovers')}
                className="bg-mars-red hover:bg-mars-red/80 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Browse Mars Photos
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="glass-effect rounded-xl overflow-hidden group cursor-pointer card-hover"
                onClick={() => handleItemClick(favorite)}
              >
                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden bg-space-dark/50">
                  {favorite.thumbnail ? (
                    <img
                      src={favorite.thumbnail}
                      alt={favorite.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">{getTypeIcon(favorite.type)}</span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute top-2 right-2">
                    <FavoriteButton
                      item={favorite}
                      className="text-white hover:text-solar-orange bg-black/50 rounded-full p-2"
                      size="sm"
                    />
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white flex items-center space-x-1">
                      <span>{getTypeIcon(favorite.type)}</span>
                      <span>{getTypeLabel(favorite.type)}</span>
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">
                    {favorite.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Saved {new Date(favorite.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {favorites.length > 0 && (
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-inter font-bold text-white mb-4">
              📊 Collection Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-purple">
                  {favorites.filter(f => f.type === 'apod').length}
                </div>
                <div className="text-gray-400 text-sm">APOD Images</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-mars-red">
                  {favorites.filter(f => f.type === 'mars-photo').length}
                </div>
                <div className="text-gray-400 text-sm">Mars Photos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-solar-orange">
                  {favorites.filter(f => f.type === 'neo').length}
                </div>
                <div className="text-gray-400 text-sm">NEO Objects</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;