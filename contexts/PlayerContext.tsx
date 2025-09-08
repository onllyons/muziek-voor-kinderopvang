import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import TrackPlayer, {
  Event,
  State,
  Track as RNTPTrack,
  usePlaybackState,
} from "react-native-track-player";

export type Track = {
  title: string;
  coverUrl: string | number;
  audioUrl?: string;
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  isExpanded: boolean;
  currentFilter: string | null;
  favorites: string[];

  playlist: Track[];
  currentIndex: number;

  playFromList: (
    list: { title: string; url: string }[],
    startIndex: number,
    coverUrl: string | number
  ) => Promise<void>;
  setCurrentTrack: (
    track: Track | null,
    opts?: { autoExpand?: boolean }
  ) => Promise<void>;
  togglePlay: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
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
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
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
  async function playFromList(
    list: { title: string; url: string }[],
    startIndex: number,
    coverUrl: string | number
  ) {
    const tracks: Track[] = list.map((it) => ({
      title: it.title,
      audioUrl: it.url,
      coverUrl,
    }));

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(
        tracks.map((t) => ({
          id: t.title,
          url: t.audioUrl!,
          title: t.title,
          artwork: t.coverUrl as any,
        }))
      );
      await TrackPlayer.skip(startIndex);
      await TrackPlayer.play();

      setPlaylist(tracks);
      setCurrentIndex(startIndex);
      setCurrentTrackState(tracks[startIndex]);
      setIsPlaying(true);
      setIsExpanded(false);
    } catch (e) {
      console.warn("playFromList error:", e);
      setIsPlaying(false);
    }
  }

  async function setCurrentTrack(
    track: Track | null,
    opts: { autoExpand?: boolean } = {}
  ) {
    setCurrentTrackState(track);

    if (track?.audioUrl) {
      try {
        const same = currentTrack?.title === track.title;
        if (!same) {
          await TrackPlayer.reset();
          await TrackPlayer.add({
            id: track.title,
            url: track.audioUrl,
            title: track.title,
            artwork: track.coverUrl as any,
          });
          setPlaylist([track]);
          setCurrentIndex(0);
        }

        await TrackPlayer.play();
        setIsPlaying(true);
        setIsExpanded(!!opts.autoExpand);
      } catch (e) {
        console.warn("TrackPlayer setCurrentTrack error:", e);
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
      setIsExpanded(false);
    }
  }

  async function togglePlay() {
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Playing) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn("TrackPlayer togglePlay error:", e);
    }
  }

  async function skipToNext() {
    try {
      if (playlist.length === 0) return;
      if (currentIndex >= playlist.length - 1) return;

      await TrackPlayer.skipToNext();

      const nextIndex = Math.min(currentIndex + 1, playlist.length - 1);
      setCurrentIndex(nextIndex);
      setCurrentTrackState(playlist[nextIndex] ?? null);
      setIsPlaying(true);
    } catch (e: any) {
      console.warn("skipToNext error:", e);
    }
  }

  async function skipToPrevious() {
    try {
      if (playlist.length === 0) return;
      if (currentIndex <= 0) return;

      await TrackPlayer.skipToPrevious();

      const prevIndex = Math.max(currentIndex - 1, 0);
      setCurrentIndex(prevIndex);
      setCurrentTrackState(playlist[prevIndex] ?? null);
      setIsPlaying(true);
    } catch (e: any) {
      console.warn("skipToPrevious error:", e);
    }
  }

  useEffect(() => {
    const sub1 = TrackPlayer.addEventListener(
      Event.PlaybackState,
      ({ state }) => {
        setIsPlaying(state === State.Playing);
      }
    );

    const sub2 = TrackPlayer.addEventListener(
      Event.PlaybackTrackChanged,
      ({ nextTrack }) => {
        if (typeof nextTrack !== "number" || nextTrack < 0) {
          return;
        }
        setCurrentIndex(nextTrack);
        setCurrentTrackState(playlist[nextTrack] ?? null);
      }
    );
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, [playlist]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isExpanded,
        currentFilter,
        favorites,
        playlist,
        currentIndex,
        playFromList,
        setCurrentTrack,
        togglePlay,
        skipToNext,
        skipToPrevious,
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
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return ctx;
}
