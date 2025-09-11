import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import TrackPlayer, { Event, State } from "react-native-track-player";

export type Track = {
  title: string;
  coverUrl: string | number;
  audioUrl?: string;
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  uiIntendsToPlay: boolean;
  isExpanded: boolean;
  currentFilter: string | null;
  favorites: Track[];
  playlist: Track[];
  currentIndex: number;
  setUiIntends: (val: boolean) => void;

  playFromList: (
    list: { title: string; url: string }[],
    startIndex: number,
    coverUrl: string | number,
    opts?: { autoExpand?: boolean }
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
  addToFavorites: (track: Track) => void;
  removeFromFavorites: (title: string) => void;
  isFavorite: (title: string) => boolean;
  noteExternalSeek: (targetSec: number) => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const DEBUG = __DEV__;
  const log = (...args: any[]) => {
    if (DEBUG) console.log(...args);
  };

  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const intendsToPlayRef = useRef(false);
  const [uiIntendsToPlay, setUiIntendsToPlay] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const lastToggleRef = useRef(0);

  const cmdLockRef = useRef(false);
  async function withCmdLock<T>(fn: () => Promise<T>): Promise<T | void> {
    if (cmdLockRef.current) return;
    cmdLockRef.current = true;
    try {
      return await fn();
    } finally {
      cmdLockRef.current = false;
    }
  }

  const playlistRef = useRef<Track[]>([]);
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  const suppressTrackChangeRef = useRef(false);
  const desiredIndexRef = useRef<number | null>(null);
  const lastSeekAtRef = useRef(0);
  const lastSeekTargetRef = useRef<number | null>(null);
  function noteExternalSeek(targetSec: number) {
    lastSeekAtRef.current = Date.now();
    lastSeekTargetRef.current = targetSec;
  }

  function setIntends(val: boolean) {
    intendsToPlayRef.current = val;
    setUiIntendsToPlay(val);
  }

  function setUiIntends(val: boolean) {
    setIntends(val);
  }

  const expandPlayer = () => setIsExpanded(true);
  const collapsePlayer = () => setIsExpanded(false);
  const setFilter = (f: string | null) => setCurrentFilter(f);
  const addToFavorites = (track: Track) =>
    setFavorites((prev) =>
      prev.some((t) => t.title === track.title) ? prev : [...prev, track]
    );
  const removeFromFavorites = (title: string) =>
    setFavorites((prev) => prev.filter((t) => t.title !== title));

  const isFavorite = (title: string) =>
    favorites.some((t) => t.title === title);

  async function playFromList(
    list: { title: string; url: string }[],
    startIndex: number,
    coverUrl: string | number,
    opts: { autoExpand?: boolean } = {}
  ) {
    log("[PLAY_FROM_LIST] startIndex=", startIndex, "inputLen=", list.length);

    const valid = list.filter((t) => !!t.url);
    if (valid.length === 0) {
      console.warn("playFromList: no valid URLs");
      setIntends(false);
      return;
    }

    const tracks: Track[] = list.map((it) => ({
      title: it.title,
      audioUrl: it.url,
      coverUrl,
    }));
    log("[PLAY_FROM_LIST] tracksLen=", tracks.length);

    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setCurrentTrackState(tracks[startIndex] ?? null);
    setIntends(true);

    suppressTrackChangeRef.current = true;
    desiredIndexRef.current = startIndex;

    await withCmdLock(async () => {
      try {
        await TrackPlayer.reset();
        await TrackPlayer.add(
          tracks.map((t, i) => ({
            id: `${t.title}__${i}__${t.audioUrl}`,
            url: t.audioUrl!,
            title: t.title,
            artwork: t.coverUrl as any,
          }))
        );
        await TrackPlayer.skip(startIndex);
        await TrackPlayer.play();
        setIsExpanded(!!opts.autoExpand);
        log("[PLAY_FROM_LIST] queued & playing at index", startIndex);
      } catch (e) {
        console.warn("playFromList error:", e);
        setIntends(false);
        suppressTrackChangeRef.current = false;
        desiredIndexRef.current = null;
      }
    });
  }

  async function setCurrentTrack(
    track: Track | null,
    opts: { autoExpand?: boolean } = {}
  ) {
    log("[SET_CURRENT_TRACK]", track?.title);
    if (!track?.audioUrl) {
      try {
        await TrackPlayer.reset();
      } catch {}
      setIntends(false);
      setCurrentTrackState(null);
      setIsPlaying(false);
      setIsExpanded(false);
      setPlaylist([]);
      setCurrentIndex(-1);
      return;
    }

    setCurrentTrackState(track);
    setPlaylist([track]);
    setCurrentIndex(0);
    setIntends(true);
    suppressTrackChangeRef.current = true;
    desiredIndexRef.current = 0;
    await withCmdLock(async () => {
      try {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: `${track.title}__single__${track.audioUrl}`,
          url: track.audioUrl!,
          title: track.title,
          artwork: track.coverUrl as any,
        });
        await TrackPlayer.play();
        setIsExpanded(!!opts.autoExpand);
      } catch (e) {
        console.warn("setCurrentTrack error:", e);
        setIntends(false);
        setIsPlaying(false);
        suppressTrackChangeRef.current = false;
        desiredIndexRef.current = null;
      }
    });
  }

  async function togglePlay() {
    log("[TOGGLE_PLAY]");
    const now = Date.now();
    if (now - lastToggleRef.current < 250) return;
    lastToggleRef.current = now;

    try {
      const state = await TrackPlayer.getState();
      if (intendsToPlayRef.current && state !== State.Playing) return;
      if (state === State.Playing) {
        setIntends(false);
        await TrackPlayer.pause();
      } else {
        setIntends(true);
        await TrackPlayer.play();
      }
    } catch (e) {
      console.warn("togglePlay error:", e);
    }
  }

  async function skipTo(targetIndex: number) {
    const queueLen = playlistRef.current.length;
    log(
      "[SKIP_TO] targetIndex=",
      targetIndex,
      "queueLen=",
      queueLen,
      "currentIndex=",
      currentIndex
    );

    if (queueLen === 0) return;
    if (targetIndex < 0 || targetIndex >= queueLen) return;

    setIntends(true);
    desiredIndexRef.current = targetIndex;
    suppressTrackChangeRef.current = true;

    await withCmdLock(async () => {
      try {
        await TrackPlayer.skip(targetIndex);
        await TrackPlayer.play();
      } catch (e) {
        console.warn("skipTo error:", e);
        suppressTrackChangeRef.current = false;
        desiredIndexRef.current = null;
        setIntends(false);
      }
    });
  }

  async function skipToNext() {
    const queueLen = playlistRef.current.length;
    const next = currentIndex + 1;
    log("[SKIP_TO_NEXT] trying next=", next, "queueLen=", queueLen);

    if (queueLen === 0 || next >= queueLen) return;
    await skipTo(next);
  }

  async function skipToPrevious() {
    const queueLen = playlistRef.current.length;
    log("[SKIP_TO_PREV] queueLen=", queueLen, "currentIndex=", currentIndex);

    if (queueLen === 0) return;

    try {
      const pos = await TrackPlayer.getPosition();
      if (pos > 3) {
        await TrackPlayer.seekTo(0);
        return;
      }
    } catch {}

    const prev = currentIndex - 1;
    if (prev < 0) return;
    await skipTo(prev);
  }

  useEffect(() => {
    const subState = TrackPlayer.addEventListener(
      Event.PlaybackState,
      ({ state }) => {
        const playingLike =
          state === State.Playing ||
          state === State.Buffering ||
          state === State.Connecting;
        setIsPlaying(playingLike);
        log("[STATE]", state);
      }
    );

    const subTrack = TrackPlayer.addEventListener(
      Event.PlaybackTrackChanged,
      async ({ nextTrack, track }) => {
        log("[TRACK_CHANGED] from", track, "to", nextTrack);
        if (typeof nextTrack !== "number" || nextTrack < 0) return;

        const now = Date.now();
        const SEEK_HOLD_MS = 900;
        if (
          lastSeekAtRef.current &&
          now - lastSeekAtRef.current < SEEK_HOLD_MS
        ) {
          if (
            !suppressTrackChangeRef.current &&
            desiredIndexRef.current == null
          ) {
            log("[TRACK_CHANGED] suppressed auto-advance after seek");
            try {
              const currentIdx = currentIndex;
              suppressTrackChangeRef.current = true;
              desiredIndexRef.current = currentIdx;

              await TrackPlayer.skip(currentIdx);

              const dur = await TrackPlayer.getDuration?.();
              if (dur && lastSeekTargetRef.current != null) {
                const safePos = Math.max(
                  0.05,
                  Math.min(lastSeekTargetRef.current, dur - 2)
                );
                await TrackPlayer.seekTo(safePos);
              }
              await TrackPlayer.play();
            } catch (e) {
              console.warn("auto-advance suppress failed", e);
            } finally {
              lastSeekAtRef.current = 0;
              lastSeekTargetRef.current = null;
            }
            return;
          }
        }
        if (suppressTrackChangeRef.current) {
          if (desiredIndexRef.current === nextTrack) {
            suppressTrackChangeRef.current = false;
            desiredIndexRef.current = null;
          } else {
            return;
          }
        }

        const pl = playlistRef.current;
        setCurrentIndex(nextTrack);
        setCurrentTrackState(pl[nextTrack] ?? null);
      }
    );

    const subQueueEnded = TrackPlayer.addEventListener(
      Event.PlaybackQueueEnded,
      () => {
        log("[QUEUE_ENDED]");
        suppressTrackChangeRef.current = false;
        desiredIndexRef.current = null;
        setIntends(false);
        setIsPlaying(false);
      }
    );

    const subError = TrackPlayer.addEventListener(Event.PlaybackError, (e) => {
      log("[PLAYBACK_ERROR]", e);
      suppressTrackChangeRef.current = false;
      desiredIndexRef.current = null;
      console.warn("PlaybackError:", e);
      setIntends(false);
      setIsPlaying(false);
    });

    return () => {
      subState.remove();
      subTrack.remove();
      subQueueEnded.remove();
      subError.remove();
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        uiIntendsToPlay,
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
        setUiIntends,
        noteExternalSeek,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
