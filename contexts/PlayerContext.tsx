import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import TrackPlayer, { Event, RepeatMode, State } from "react-native-track-player";
import { DEFAULT_COVER } from "@/lib/queries";
import {
  applyMaxVolume,
  getVolumeDebugInfo,
  isVolumeDebugEnabled,
} from "@/lib/volume";

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
  hidePlayerUI: boolean;
  setUiIntends: (val: boolean) => void;
  setHidePlayerUI: (val: boolean) => void;

  playFromList: (
    list: { title: string; url: string; coverUrl?: string | number }[],
    startIndex: number,
    coverUrl?: string | number,
    opts?: { autoExpand?: boolean; repeatMode?: RepeatMode }
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
  const [hidePlayerUI, setHidePlayerUI] = useState(false);

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

  async function showVolumeDebug(source: string) {
    if (!__DEV__ && !isVolumeDebugEnabled()) return;
    try {
      const info = await getVolumeDebugInfo();
      const loadedAt = info.loadedAt
        ? new Date(info.loadedAt).toISOString()
        : "never";
      Alert.alert(
        "Volume debug",
        `source: ${source}\n` +
          `supabase raw: ${String(info.raw ?? "null")}\n` +
          `debug enabled: ${info.debugEnabled} (${String(
            info.debugRaw ?? "null"
          )})\n` +
          `normalized: ${info.normalized}\n` +
          `curve: ${info.curve} (${String(info.curveRaw ?? "null")})\n` +
          `effective: ${info.effective}\n` +
          `player volume: ${info.player ?? "unknown"}\n` +
          `system volume: n/a\n` +
          `loaded at: ${loadedAt}`
      );
    } catch (e) {
      console.warn("volume debug error:", e);
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
    list: { title: string; url: string; coverUrl?: string | number }[],
    startIndex: number,
    coverUrl?: string | number,
    opts: { autoExpand?: boolean; repeatMode?: RepeatMode } = {}
  ) {
    log("[PLAY_FROM_LIST] startIndex=", startIndex, "inputLen=", list.length);
    if (__DEV__) {
      console.log("[PLAY_FROM_LIST] input", {
        startIndex,
        repeatMode: opts.repeatMode ?? RepeatMode.Queue,
        selected: list[startIndex]
          ? {
              title: list[startIndex].title,
              url: list[startIndex].url ?? null,
              hasUrl: !!list[startIndex].url,
              coverUrl: list[startIndex].coverUrl ?? null,
              hasCoverUrl: !!list[startIndex].coverUrl,
            }
          : null,
        items: list.map((item, index) => ({
          index,
          title: item.title,
          url: item.url ?? null,
          hasUrl: !!item.url,
          coverUrl: item.coverUrl ?? null,
          hasCoverUrl: !!item.coverUrl,
        })),
      });
    }

    const valid = list.filter((t) => !!t.url);
    if (valid.length === 0) {
      console.warn("playFromList: no valid URLs");
      setIntends(false);
      return;
    }

    const fallbackCover = coverUrl ?? DEFAULT_COVER;
    const tracks: Track[] = list.map((it) => ({
      title: it.title,
      audioUrl: it.url,
      coverUrl: it.coverUrl ?? fallbackCover,
    }));
    log("[PLAY_FROM_LIST] tracksLen=", tracks.length);
    if (__DEV__) {
      console.log("[PLAY_FROM_LIST] normalized tracks", {
        fallbackCover,
        tracks: tracks.map((track, index) => ({
          index,
          title: track.title,
          audioUrl: track.audioUrl ?? null,
          hasAudioUrl: !!track.audioUrl,
          coverUrl: track.coverUrl ?? null,
          hasCoverUrl: !!track.coverUrl,
        })),
      });
    }

    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setCurrentTrackState(tracks[startIndex] ?? null);
    setIntends(true);

    suppressTrackChangeRef.current = true;
    desiredIndexRef.current = startIndex;

    const repeatMode = opts.repeatMode ?? RepeatMode.Queue;

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
        await TrackPlayer.setRepeatMode(repeatMode);
        await TrackPlayer.play();
        await applyMaxVolume();
        await showVolumeDebug("playFromList");
        setIsExpanded(!!opts.autoExpand);
        log("[PLAY_FROM_LIST] queued & playing at index", startIndex);
      } catch (e) {
        console.warn("playFromList error:", e);
        if (__DEV__) {
          console.log("[PLAY_FROM_LIST] failure context", {
            startIndex,
            repeatMode,
            selected: tracks[startIndex]
              ? {
                  title: tracks[startIndex].title,
                  audioUrl: tracks[startIndex].audioUrl ?? null,
                  coverUrl: tracks[startIndex].coverUrl ?? null,
                }
              : null,
          });
        }
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
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
        await TrackPlayer.play();
        await applyMaxVolume();
        await showVolumeDebug("setCurrentTrack");
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
        await applyMaxVolume();
        await showVolumeDebug("togglePlay");
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
        await applyMaxVolume();
        await showVolumeDebug("skipTo");
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
        hidePlayerUI,
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
        setHidePlayerUI,
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
