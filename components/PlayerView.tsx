import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  BackHandler,
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
import TrackPlayer, { useProgress } from "react-native-track-player";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MINI_PLAYER_HEIGHT = 80;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.9;

export default function PlayerView() {
  const {
    currentTrack,
    isExpanded,
    expandPlayer,
    collapsePlayer,
    isPlaying,
    togglePlay,
  } = usePlayer();

  const translateY = useSharedValue(EXPANDED_HEIGHT - MINI_PLAYER_HEIGHT);

  // Derived value ca să știm progresul de animație (0 = mic, 1 = mare)
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

  // Ascultă starea de expand/collapse din context
  useEffect(() => {
    translateY.value = withSpring(
      isExpanded ? 0 : EXPANDED_HEIGHT - MINI_PLAYER_HEIGHT
    );
  }, [isExpanded, translateY]);

  // Back button (Android) închide sheet-ul dacă e expandat
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

  // Progress bar
  const { position, duration } = useProgress(250);
  const progressPct = duration > 0 ? (position / duration) * 100 : 0;

  const handlePlayPause = () => togglePlay();

  const handlePrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch {}
  };

  const handleNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch {}
  };

  const handleCardPress = () => {
    if (!isExpanded) expandPlayer();
  };

  const handleBackdropPress = () => {
    if (isExpanded) collapsePlayer();
  };

  if (!currentTrack) return null;

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

      <Animated.View style={styles.playerContainer}>
        {/* Mini-player */}
      {!isExpanded && (
        <View style={styles.miniPlayer}>
          <TouchableOpacity
            style={styles.miniPlayerMain}
            onPress={handleCardPress}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: currentTrack.coverUrl }}
              style={styles.miniCover}
            />

            <View style={styles.miniContent}>
              <Text style={styles.miniTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>

              <View style={styles.miniProgressContainer}>
                <View style={styles.miniProgressTrack}>
                  <View
                    style={[
                      styles.miniProgressFill,
                      { width: `${progressPct}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniPlayButton}
            onPress={handlePlayPause}
          >
            {isPlaying ? (
              <Pause size={20} color="#333" fill="#333" />
            ) : (
              <Play size={20} color="#333" fill="#333" />
            )}
          </TouchableOpacity>
        </View>
        )}

        {/* Expanded player */}
        <Animated.View style={[styles.expandedPlayer, expandedContentStyle]}>
            <TouchableOpacity style={styles.dragHandle} onPress={collapsePlayer} activeOpacity={0.7} />


          <View style={styles.expandedHeader}>
    <TouchableOpacity onPress={collapsePlayer} style={styles.backButton} hitSlop={{top:10,bottom:10,left:10,right:10}}>
      {/* Poți folosi și ChevronDown/X din lucide-react-native */}
      <Text style={styles.backLabel}>Back</Text>
    </TouchableOpacity>
    {/* (opțional) titlu scurt aici */}
  </View>

          <Image
            source={{ uri: currentTrack.coverUrl }}
            style={styles.expandedCover}
          />

          <Text style={styles.expandedTitle}>{currentTrack.title}</Text>
          <Text style={styles.expandedArtist}>Kinderen Muziek</Text>

          <View style={styles.expandedProgressContainer}>
            <View style={styles.expandedProgressTrack}>
              <View
                style={[
                  styles.expandedProgressFill,
                  { width: `${progressPct}%` },
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{Math.floor(position)}s</Text>
              <Text style={styles.timeText}>{Math.floor(duration)}s</Text>
            </View>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePrevious}
            >
              <SkipBack size={32} color="#333" fill="#333" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButtonLarge}
              onPress={handlePlayPause}
            >
              {isPlaying ? (
                <Pause size={40} color="#FFF" fill="#FFF" />
              ) : (
                <Play size={40} color="#FFF" fill="#FFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleNext}
            >
              <SkipForward size={32} color="#333" fill="#333" />
            </TouchableOpacity>
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
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playerContainer: {
    backgroundColor: "#FEF7F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: EXPANDED_HEIGHT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    flexDirection: "column",
    alignItems: "stretch",
  },
  miniPlayer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  miniPlayerMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minHeight: 44,
  },
  miniCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  miniContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  miniProgressContainer: { width: "100%" },
  miniProgressTrack: {
    height: 3,
    backgroundColor: "#E0E0E0",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 1.5,
  },
  miniPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  expandedPlayer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#C0C0C0",
    borderRadius: 2,
    marginBottom: 30,
    alignSelf: "center",
  },
  expandedCover: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginBottom: 30,
  },
  expandedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  expandedArtist: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  expandedProgressContainer: {
    width: "100%",
    marginBottom: 40,
  },
  expandedProgressTrack: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  expandedProgressFill: {
    height: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 3,
  },
  timeContainer: {
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
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
  },

  expandedHeader: {
  width: '100%',
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 8,
  alignItems: 'flex-start',
},
backButton: {
  backgroundColor: '#F1F1F1',
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 6,
},
backLabel: {
  fontSize: 16,
  color: '#333',
  fontWeight: '600',
},




});
