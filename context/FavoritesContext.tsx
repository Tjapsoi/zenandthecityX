import React, { createContext, useContext, useState, useCallback } from 'react';
import { ZenPlace } from '../data/zenPlaces';

interface FavoritesContextType {
  favorites: ZenPlace[];
  addFavorite: (place: ZenPlace) => void;
  removeFavorite: (placeId: string) => void;
  isFavorite: (placeId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ZenPlace[]>([]);

  const addFavorite = useCallback((place: ZenPlace) => {
    setFavorites(prev => {
      if (prev.find(p => p.id === place.id)) return prev;
      return [...prev, place];
    });
  }, []);

  const removeFavorite = useCallback((placeId: string) => {
    setFavorites(prev => prev.filter(p => p.id !== placeId));
  }, []);

  const isFavorite = useCallback((placeId: string) => {
    return favorites.some(p => p.id === placeId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 