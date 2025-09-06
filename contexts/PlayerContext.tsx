import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlayerContextType {
  currentTrack: {
    title: string;
    coverUrl: string;
  } | null;
  isExpanded: boolean;
  currentFilter: string | null;
  favorites: string[];
  setCurrentTrack: (track: { title: string; coverUrl: string } | null) => void;
  expandPlayer: () => void;
  collapsePlayer: () => void;
  setFilter: (filter: string | null) => void;
  addToFavorites: (title: string) => void;
  removeFromFavorites: (title: string) => void;
  isFavorite: (title: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<{
    title: string;
    coverUrl: string;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const expandPlayer = () => setIsExpanded(true);
  const collapsePlayer = () => setIsExpanded(false);
  const setFilter = (filter: string | null) => setCurrentFilter(filter);
  
  const addToFavorites = (title: string) => {
    setFavorites(prev => prev.includes(title) ? prev : [...prev, title]);
  };
  
  const removeFromFavorites = (title: string) => {
    setFavorites(prev => prev.filter(item => item !== title));
  };
  
  const isFavorite = (title: string) => {
    return favorites.includes(title);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isExpanded,
        currentFilter,
        favorites,
        setCurrentTrack,
        expandPlayer,
        collapsePlayer,
        setFilter,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}