// contexts/PlayerContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import TrackPlayer from 'react-native-track-player';

// Tip pentru un track – am lăsat coverUrl ca string | number ca să poți pune și require(...)
export type Track = {
  title: string;
  coverUrl: string | number;
  audioUrl?: string; // URL mp3 – opțional
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  isExpanded: boolean;
  currentFilter: string | null;
  favorites: string[];

  // acțiuni
  setCurrentTrack: (track: Track | null, opts?: { autoExpand?: boolean }) => Promise<void>;
  togglePlay: () => Promise<void>;
  expandPlayer: () => void;
  collapsePlayer: () => void;
  setFilter: (filter: string | null) => void;
  addToFavorites: (title: string) => void;
  removeFromFavorites: (title: string) => void;
  isFavorite: (title: string) => boolean;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const expandPlayer = () => setIsExpanded(true);
  const collapsePlayer = () => setIsExpanded(false);
  const setFilter = (filter: string | null) => setCurrentFilter(filter);

  const addToFavorites = (title: string) => {
    setFavorites((prev) => (prev.includes(title) ? prev : [...prev, title]));
  };
  const removeFromFavorites = (title: string) => {
    setFavorites((prev) => prev.filter((t) => t !== title));
  };
  const isFavorite = (title: string) => favorites.includes(title);

  async function setCurrentTrack(
    track: Track | null,
    opts: { autoExpand?: boolean } = {}
  ) {
    setCurrentTrackState(track);

    // dacă avem URL audio → pregătim coada și pornim
    if (track?.audioUrl) {
      try {
        // dacă e aceeași piesă, nu mai reseta coada
        const same = currentTrack?.title === track.title;
        if (!same) {
          await TrackPlayer.reset();
          await TrackPlayer.add({
            id: track.title, // ideal: un id unic stabil
            url: track.audioUrl,
            title: track.title,
            artwork: track.coverUrl as any,
          });
        }

        await TrackPlayer.play();
        setIsPlaying(true);

        if (opts.autoExpand) {
          setIsExpanded(true);
        } else {
          setIsExpanded(false);
        }
      } catch (e) {
        console.warn('TrackPlayer setCurrentTrack error:', e);
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
      setIsExpanded(false);
    }
  }

  async function togglePlay() {
    try {
      if (isPlaying) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('TrackPlayer togglePlay error:', e);
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isExpanded,
        currentFilter,
        favorites,
        setCurrentTrack,
        togglePlay,
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
  const ctx = useContext(PlayerContext);
  if (ctx === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return ctx;
}
