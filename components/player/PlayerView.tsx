import React, { useEffect } from "react";
import { View, Pressable, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import TrackPlayer, { State } from "react-native-track-player";
import { usePlayer } from "@/contexts/PlayerContext";
import { useProgress } from "react-native-track-player";
import MiniPlayer from "./MiniPlayer";
import ExpandedPlayer from "./ExpandedPlayer";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MINI_PLAYER_HEIGHT = 120;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.879;

export default function PlayerView() {
  const {
    currentTrack,
    isExpanded,
    expandPlayer,
    collapsePlayer,
    isPlaying,
    uiIntendsToPlay,
    togglePlay,
    skipToNext,
    skipToPrevious,
    playlist,
    currentIndex,
    setUiIntends,
    noteExternalSeek,
  } = usePlayer();

  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < playlist.length - 1;
  const showPause = isPlaying || uiIntendsToPlay;
  const ENABLE_MINI_SCRUB = false;
  const translateY = useSharedValue(EXPANDED_HEIGHT - MINI_PLAYER_HEIGHT);
  const sheetProgress = useDerivedValue(() =>
    interpolate(
      translateY.value,
      [EXPANDED_HEIGHT - MINI_PLAYER_HEIGHT, 0],
      [0, 1],
      Extrapolate.CLAMP
    )
  );
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const expandedContentStyle = useAnimatedStyle(() => ({
    opacity: sheetProgress.value,
  }));

  useEffect(() => {
    translateY.value = withSpring(
      isExpanded ? 0 : EXPANDED_HEIGHT - MINI_PLAYER_HEIGHT
    );
  }, [isExpanded]);

  const { position, duration } = useProgress(250);

  const wasPlayingBeforeScrub = React.useRef(false);

  if (!currentTrack) return null;
  const coverSource =
    typeof currentTrack.coverUrl === "number"
      ? currentTrack.coverUrl
      : { uri: String(currentTrack.coverUrl) };

  const PAD_START = 0.05;
  const PAD_END = 2;

  const safeSeek = async (target: number) => {
    const d = duration || 0;
    const SAFE_END_GAP = Math.min(12, Math.max(8, d * 0.1));
    const PAD_START = 0.05;

    let safeTarget = Math.max(
      PAD_START,
      Math.min(target, Math.max(0, d - SAFE_END_GAP))
    );
    noteExternalSeek(safeTarget);
    if (safeTarget >= d - 1) {
      console.log(
        "[SAFE_SEEK] ajustat:",
        safeTarget,
        "->",
        d - Math.max(8, SAFE_END_GAP)
      );
      safeTarget = Math.max(PAD_START, d - Math.max(8, SAFE_END_GAP));
    }

    console.log(
      `[SEEK] ${currentTrack?.title} idx=${currentIndex} pos=${position.toFixed(
        2
      )} -> target=${safeTarget.toFixed(2)} / dur=${d.toFixed(2)}`
    );
    try {
      await TrackPlayer.seekTo(safeTarget);
      try {
        const posNow = await TrackPlayer.getPosition();
        if (d > 0 && posNow >= d - 0.5) {
          const retry = Math.max(PAD_START, d - (SAFE_END_GAP + 2));
          console.log(
            "[SAFE_SEEK] retry too close to end:",
            posNow,
            "->",
            retry
          );
          await TrackPlayer.seekTo(retry);
        }
      } catch {}
    } catch (e) {
      console.warn("seek error", e);
    }
  };

  const onSeek = async (newPos: number) => {
    await safeSeek(newPos);
  };

  const onScrubStart = async () => {
    try {
      const st = await TrackPlayer.getState();
      wasPlayingBeforeScrub.current =
        st === State.Playing ||
        st === State.Buffering ||
        st === State.Connecting;

      await TrackPlayer.pause();
      setUiIntends(false);

      console.log(
        "[SCRUB_START] paused, wasPlaying=",
        wasPlayingBeforeScrub.current
      );
    } catch {}
  };

  const onScrubEnd = async (finalSec: number) => {
    await safeSeek(finalSec);
    if (wasPlayingBeforeScrub.current) {
      await new Promise((r) => setTimeout(r, 150));
      await TrackPlayer.play();
      console.log("[SCRUB_END] resume play");
    } else {
      console.log("[SCRUB_END] stay paused");
    }
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents="box-none"
    >
      {isExpanded && (
        <Pressable
          style={styles.backdrop}
          onPress={collapsePlayer}
          accessibilityLabel="Închide playerul"
        />
      )}

      <Animated.View
        style={[
          styles.playerContainer,
          isExpanded ? styles.noShadow : styles.shadow,
        ]}
        accessible
        accessibilityLabel="Player audio"
      >
        {!isExpanded && (
          <MiniPlayer
            title={currentTrack.title}
            coverSource={coverSource}
            position={position}
            duration={duration}
            showPause={showPause}
            onTogglePlay={togglePlay}
            onOpen={expandPlayer}
            onSeek={onSeek}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
            enableScrub={false}
          />
        )}

        <Animated.View style={[styles.expanded, expandedContentStyle]}>
          <ExpandedPlayer
            title={currentTrack.title}
            coverSource={coverSource}
            position={position}
            duration={duration}
            onSeek={onSeek}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
            showPause={showPause}
            onTogglePlay={togglePlay}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={skipToPrevious}
            onNext={skipToNext}
            onClose={collapsePlayer}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    justifyContent: "flex-end",
  },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  playerContainer: {
    backgroundColor: "#FEF7F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: EXPANDED_HEIGHT,
    flexDirection: "column",
    alignItems: "stretch",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  noShadow: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  expanded: { flex: 1 },
});
