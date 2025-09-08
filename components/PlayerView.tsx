import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  BackHandler,
  LayoutChangeEvent,
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
import { usePlayer } from "@/contexts/PlayerContext";
import { useProgress } from "react-native-track-player";
import BackHeader from "@/components/BackHeader";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MINI_PLAYER_HEIGHT = 120;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.879;

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const rr = r < 10 ? `0${r}` : `${r}`;
  return `${m}:${rr}`;
}

export default function PlayerView() {
  const {
    currentTrack,
    isExpanded,
    expandPlayer,
    collapsePlayer,
    isPlaying,
    togglePlay,
    skipToNext,
    skipToPrevious,
    playlist,
    currentIndex,
  } = usePlayer();

  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < playlist.length - 1;
  const handlePrevious = () => {
    if (canPrev) skipToPrevious();
  };
  const handleNext = () => {
    if (canNext) skipToNext();
  };
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

  const { position, duration } = useProgress(250);
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
  const miniKnobX = Math.max(
    0,
    Math.min(
      (progressPct / 100) * (miniTrackW - MINI_KNOB),
      Math.max(0, miniTrackW - MINI_KNOB)
    )
  );
  const miniFillWidth = Math.max(
    0,
    Math.min(miniKnobX + MINI_KNOB / 2, miniTrackW)
  );
  const [expTrackW, setExpTrackW] = useState(0);
  const onExpTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setExpTrackW(e.nativeEvent.layout.width);
  }, []);
  const EXP_KNOB = 20;
  const expKnobX = Math.max(
    0,
    Math.min(
      (progressPct / 100) * (expTrackW - EXP_KNOB),
      Math.max(0, expTrackW - EXP_KNOB)
    )
  );
  const expFillWidth = Math.max(
    0,
    Math.min(expKnobX + EXP_KNOB / 2, expTrackW)
  );

  if (!currentTrack) return null;

  const elapsed = formatTime(position);
  const remaining =
    duration > 0 ? `-${formatTime(Math.max(0, duration - position))}` : "-0:00";

  const coverSource =
    typeof currentTrack.coverUrl === "number"
      ? currentTrack.coverUrl
      : { uri: String(currentTrack.coverUrl) };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents="box-none"
    >
      {isExpanded && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      )}

      <Animated.View
        style={[
          styles.playerContainer,
          isExpanded ? styles.playerNoShadow : styles.playerShadow,
        ]}
      >
        {!isExpanded && (
          <View style={styles.miniPlayer}>
            <TouchableOpacity
              style={styles.miniPlayerMain}
              onPress={handleCardPress}
              activeOpacity={0.8}
            >
              <Image source={coverSource} style={styles.miniCover} />

              <View style={styles.miniContent}>
                <Text style={styles.miniTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>

                <View
                  style={styles.miniProgressRow}
                  onLayout={onMiniTrackLayout}
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
                </View>

                <View style={styles.miniTimeRow}>
                  <Text style={styles.miniTimeText}>{elapsed}</Text>
                  <Text style={styles.miniTimeText}>{remaining}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniPlayButton}
              onPress={handlePlayPause}
            >
              {isPlaying ? (
                <Pause size={33} color="#FF6B81" fill="#FF6B81" />
              ) : (
                <Play size={33} color="#FF6B81" fill="#FF6B81" />
              )}
            </TouchableOpacity>
          </View>
        )}

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

              <View
                style={styles.expandedProgressRow}
                onLayout={onExpTrackLayout}
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
              </View>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[styles.controlButton, !canPrev && { opacity: 0.4 }]}
                onPress={handlePrevious}
                disabled={!canPrev}
              >
                <SkipBack size={32} color="#FF6B81" fill="#FF6B81" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playButtonLarge}
                onPress={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause size={40} color="#FF6B81" fill="#FF6B81" />
                ) : (
                  <Play size={40} color="#FF6B81" fill="#FF6B81" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, !canNext && { opacity: 0.4 }]}
                onPress={handleNext}
                disabled={!canNext}
              >
                <SkipForward size={32} color="#FF6B81" fill="#FF6B81" />
              </TouchableOpacity>
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
});
