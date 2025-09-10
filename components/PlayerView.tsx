import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  BackHandler,
  LayoutChangeEvent,
  Pressable,
  GestureResponderEvent,
  AccessibilityState,
} from "react-native";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import TrackPlayer from "react-native-track-player";
import { usePlayer } from "@/contexts/PlayerContext";
import { useProgress } from "react-native-track-player";
import BackHeader from "@/components/BackHeader";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MINI_PLAYER_HEIGHT = 120;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.879;

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

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
  } = usePlayer();

  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < playlist.length - 1;

  const showPause = isPlaying || uiIntendsToPlay;

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
  }, [isExpanded, translateY]);

  useEffect(() => {
    const backAction = () => {
      if (isExpanded) {
        collapsePlayer();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isExpanded, collapsePlayer]);

  const { position: realPosition, duration } = useProgress(250);
  const [dragging, setDragging] = useState<"mini" | "exp" | null>(null);
  const [previewPos, setPreviewPos] = useState(0);
  const position = dragging ? previewPos : realPosition;

  const progressPct = duration > 0 ? (position / duration) * 100 : 0;

  const handlePlayPause = () => togglePlay();
  const handleCardPress = () => {
    if (!isExpanded) expandPlayer();
  };
  const handleBackdropPress = () => {
    if (isExpanded) collapsePlayer();
  };

  const [miniTrackW, setMiniTrackW] = useState(0);
  const onMiniTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setMiniTrackW(e.nativeEvent.layout.width);
  }, []);
  const MINI_KNOB = 17;
  const miniKnobX = clamp(
    (progressPct / 100) * (miniTrackW - MINI_KNOB),
    0,
    Math.max(0, miniTrackW - MINI_KNOB)
  );
  const miniFillWidth = clamp(miniKnobX + MINI_KNOB / 2, 0, miniTrackW);

  const [expTrackW, setExpTrackW] = useState(0);
  const onExpTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setExpTrackW(e.nativeEvent.layout.width);
  }, []);
  const EXP_KNOB = 20;
  const expKnobX = clamp(
    (progressPct / 100) * (expTrackW - EXP_KNOB),
    0,
    Math.max(0, expTrackW - EXP_KNOB)
  );
  const expFillWidth = clamp(expKnobX + EXP_KNOB / 2, 0, expTrackW);

  const seekToRatio = useCallback(
    async (ratio: number) => {
      if (!Number.isFinite(duration) || duration <= 0) return;
      const pos = clamp(ratio, 0, 1) * duration;
      try {
        await TrackPlayer.seekTo(pos);
      } catch (e) {
        console.warn("seekToRatio error", e);
      }
    },
    [duration]
  );

  const miniDraggingRef = useRef(false);
  const onMiniPress = useCallback(
    async (e: GestureResponderEvent) => {
      if (miniTrackW <= 0 || duration <= 0) return;
      const ratio = clamp(e.nativeEvent.locationX / miniTrackW, 0, 1);
      await seekToRatio(ratio);
    },
    [miniTrackW, duration, seekToRatio]
  );
  const onMiniResponderGrant = useCallback(
    (e: GestureResponderEvent) => {
      if (miniTrackW <= 0 || duration <= 0) return;
      miniDraggingRef.current = true;
      setDragging("mini");
      const ratio = clamp(e.nativeEvent.locationX / miniTrackW, 0, 1);
      setPreviewPos(ratio * duration);
    },
    [miniTrackW, duration]
  );
  const onMiniResponderMove = useCallback(
    (e: GestureResponderEvent) => {
      if (!miniDraggingRef.current || miniTrackW <= 0 || duration <= 0) return;
      const ratio = clamp(e.nativeEvent.locationX / miniTrackW, 0, 1);
      setPreviewPos(ratio * duration);
    },
    [miniTrackW, duration]
  );
  const onMiniResponderRelease = useCallback(async () => {
    if (!miniDraggingRef.current) return;
    miniDraggingRef.current = false;
    const finalPos = previewPos;
    setDragging(null);
    try {
      await TrackPlayer.seekTo(clamp(finalPos, 0, duration || 0));
    } catch (e) {
      console.warn("mini release seek error", e);
    }
  }, [previewPos, duration]);

  const expDraggingRef = useRef(false);
  const onExpPress = useCallback(
    async (e: GestureResponderEvent) => {
      if (expTrackW <= 0 || duration <= 0) return;
      const ratio = clamp(e.nativeEvent.locationX / expTrackW, 0, 1);
      await seekToRatio(ratio);
    },
    [expTrackW, duration, seekToRatio]
  );
  const onExpResponderGrant = useCallback(
    (e: GestureResponderEvent) => {
      if (expTrackW <= 0 || duration <= 0) return;
      expDraggingRef.current = true;
      setDragging("exp");
      const ratio = clamp(e.nativeEvent.locationX / expTrackW, 0, 1);
      setPreviewPos(ratio * duration);
    },
    [expTrackW, duration]
  );
  const onExpResponderMove = useCallback(
    (e: GestureResponderEvent) => {
      if (!expDraggingRef.current || expTrackW <= 0 || duration <= 0) return;
      const ratio = clamp(e.nativeEvent.locationX / expTrackW, 0, 1);
      setPreviewPos(ratio * duration);
    },
    [expTrackW, duration]
  );
  const onExpResponderRelease = useCallback(async () => {
    if (!expDraggingRef.current) return;
    expDraggingRef.current = false;
    const finalPos = previewPos;
    setDragging(null);
    try {
      await TrackPlayer.seekTo(clamp(finalPos, 0, duration || 0));
    } catch (e) {
      console.warn("exp release seek error", e);
    }
  }, [previewPos, duration]);

  if (!currentTrack) return null;

  const elapsed = formatTime(position);
  const remaining =
    duration > 0 ? `-${formatTime(Math.max(0, duration - position))}` : "-0:00";
  const coverSource =
    typeof currentTrack.coverUrl === "number"
      ? currentTrack.coverUrl
      : { uri: String(currentTrack.coverUrl) };

  const a11yStatePlay: AccessibilityState = { busy: showPause || undefined };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents="box-none"
    >
      {isExpanded && (
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          accessibilityLabel="Închide playerul"
        />
      )}

      <Animated.View
        style={[
          styles.playerContainer,
          isExpanded ? styles.playerNoShadow : styles.playerShadow,
        ]}
        accessible
        accessibilityLabel="Player audio"
      >
        {/* MINI PLAYER */}
        {!isExpanded && (
          <View style={styles.miniPlayer}>
            <Pressable
              style={({ pressed }) => [
                styles.miniPlayerMain,
                pressed && styles.pressed,
              ]}
              onPress={handleCardPress}
              accessibilityRole="button"
              accessibilityLabel={`Deschide playerul pentru ${currentTrack.title}`}
            >
              <Image source={coverSource} style={styles.miniCover} />

              <View style={styles.miniContent}>
                <Text style={styles.miniTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>

                <View onLayout={onMiniTrackLayout}>
                  <Pressable
                    style={styles.miniProgressRow}
                    onPress={onMiniPress}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={onMiniResponderGrant}
                    onResponderMove={onMiniResponderMove}
                    onResponderRelease={onMiniResponderRelease}
                    accessibilityLabel="Bara de progres mini"
                  >
                    <View style={styles.miniProgressTrack}>
                      <View
                        style={[
                          styles.miniProgressFill,
                          { width: miniFillWidth },
                        ]}
                      />
                    </View>

                    <View
                      style={[
                        styles.miniKnob,
                        { transform: [{ translateX: miniKnobX }] },
                      ]}
                    />
                  </Pressable>
                </View>

                <View style={styles.miniTimeRow}>
                  <Text style={styles.miniTimeText}>{elapsed}</Text>
                  <Text style={styles.miniTimeText}>{remaining}</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.miniPlayButton,
                pressed && styles.pressedLight,
              ]}
              onPress={handlePlayPause}
              accessibilityRole="button"
              accessibilityLabel={showPause ? "Pauză" : "Redă"}
              accessibilityState={a11yStatePlay}
            >
              {showPause ? (
                <Pause size={33} color="#FF6B81" fill="#FF6B81" />
              ) : (
                <Play size={33} color="#FF6B81" fill="#FF6B81" />
              )}
            </Pressable>
          </View>
        )}

        {/* EXPANDED PLAYER */}
        <Animated.View style={styles.expandedPlayer}>
          <BackHeader onBack={collapsePlayer} />
          <View style={[styles.expandedPlayerCenter, expandedContentStyle]}>
            <Image source={coverSource} style={styles.expandedCover} />
            <Text style={styles.expandedTitle}>{currentTrack.title}</Text>

            <View style={styles.expandedProgressContainer}>
              <View style={styles.expandedTimeRow}>
                <Text style={styles.timeText}>{elapsed}</Text>
                <Text style={styles.timeText}>{remaining}</Text>
              </View>

              <View onLayout={onExpTrackLayout}>
                <Pressable
                  style={styles.expandedProgressRow}
                  onPress={onExpPress}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={onExpResponderGrant}
                  onResponderMove={onExpResponderMove}
                  onResponderRelease={onExpResponderRelease}
                  accessibilityLabel="Bara de progres"
                >
                  <View style={styles.expandedProgressTrack}>
                    <View
                      style={[
                        styles.expandedProgressFill,
                        { width: expFillWidth },
                      ]}
                    />
                  </View>

                  <View
                    style={[
                      styles.expandedKnob,
                      { transform: [{ translateX: expKnobX }] },
                    ]}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.controlsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.controlButton,
                  pressed && styles.pressedLight,
                  !canPrev && { opacity: 0.4 },
                ]}
                onPress={skipToPrevious}
                disabled={!canPrev}
                accessibilityRole="button"
                accessibilityLabel="Piesa anterioară"
              >
                <SkipBack size={32} color="#FF6B81" fill="#FF6B81" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.playButtonLarge,
                  pressed && styles.pressedLight,
                ]}
                onPress={handlePlayPause}
                accessibilityRole="button"
                accessibilityLabel={showPause ? "Pauză" : "Redă"}
                accessibilityState={a11yStatePlay}
              >
                {showPause ? (
                  <Pause size={40} color="#FF6B81" fill="#FF6B81" />
                ) : (
                  <Play size={40} color="#FF6B81" fill="#FF6B81" />
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.controlButton,
                  pressed && styles.pressedLight,
                  !canNext && { opacity: 0.4 },
                ]}
                onPress={skipToNext}
                disabled={!canNext}
                accessibilityRole="button"
                accessibilityLabel="Piesa următoare"
              >
                <SkipForward size={32} color="#FF6B81" fill="#FF6B81" />
              </Pressable>
            </View>
          </View>
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
  playerShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  playerNoShadow: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  /* MINI */
  miniPlayer: {
    height: MINI_PLAYER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  miniPlayerMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minHeight: 56,
  },
  miniCover: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  miniContent: { flex: 1, marginLeft: 12, marginRight: 12 },
  miniTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 15,
  },
  miniPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  miniProgressRow: { width: "100%", justifyContent: "center" },
  miniProgressTrack: {
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },
  miniProgressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FF6B81",
    borderRadius: 5,
  },
  miniKnob: {
    position: "absolute",
    top: -6,
    width: 17,
    height: 17,
    borderRadius: 999,
    backgroundColor: "#FF6B81",
    borderWidth: 2,
    borderColor: "white",
  },
  miniTimeRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniTimeText: { fontSize: 13, color: "#505050" },

  /* EXPANDED */
  expandedPlayer: { flex: 1 },
  expandedPlayerCenter: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  expandedCover: {
    width: 258,
    height: 258,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    marginBottom: 30,
  },
  expandedTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1E1E1E",
    textAlign: "center",
  },

  expandedProgressContainer: { width: "100%", marginTop: 70, marginBottom: 40 },
  expandedProgressRow: { width: "100%", justifyContent: "center" },
  expandedProgressTrack: {
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  expandedProgressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FF6B81",
    borderRadius: 10,
  },
  expandedKnob: {
    position: "absolute",
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF6B81",
    borderWidth: 2,
    borderColor: "white",
  },
  expandedTimeRow: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  timeText: { fontSize: 14, color: "#666" },

  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#850020",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },

  pressed: { opacity: 0.85 },
  pressedLight: { opacity: 0.9 },
});
