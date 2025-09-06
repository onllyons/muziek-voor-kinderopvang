import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, BackHandler } from 'react-native';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { usePlayer } from '@/contexts/PlayerContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MINI_PLAYER_HEIGHT = 80;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.13;

export default function PlayerView() {
  const { currentTrack, isExpanded, expandPlayer, collapsePlayer } = usePlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const translateY = useSharedValue(0);

  // Mock timer for progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying]);

  // Update translateY when isExpanded changes
  useEffect(() => {
    if (isExpanded) {
      translateY.value = withSpring(-(EXPANDED_HEIGHT - MINI_PLAYER_HEIGHT));
    } else {
      translateY.value = withSpring(0);
    }
  }, [isExpanded, translateY]);

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (isExpanded) {
        collapsePlayer();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [isExpanded, collapsePlayer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, -EXPANDED_HEIGHT / 2],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(
        translateY.value,
        [-10, 0],
        [1, 1],
        Extrapolate.CLAMP
      ),
      backgroundColor: interpolate(
        translateY.value,
        [0, -EXPANDED_HEIGHT / 2],
        [0, 0.5],
        Extrapolate.CLAMP
      ) > 0.1 ? 'rgba(0,0,0,0.5)' : 'transparent',
    };
  });

  const expandedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, -EXPANDED_HEIGHT / 3],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    console.log('Previous track');
    setProgress(0);
  };

  const handleNext = () => {
    console.log('Next track');
    setProgress(0);
  };

  const handleCardPress = () => {
    if (!isExpanded) {
      expandPlayer();
    }
  };

  const handleBackdropPress = () => {
    if (isExpanded) {
      collapsePlayer();
    }
  };

  // Hide PlayerView when no current track
  if (!currentTrack) {
    return null;
  }

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
      pointerEvents={isExpanded ? 'auto' : 'box-none'}
    >
      {/* Backdrop for expanded mode - only render when expanded */}
      {isExpanded && (
        <TouchableOpacity 
          style={styles.backdrop} 
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      )}
      
      <Animated.View style={styles.playerContainer}>
        {/* Mini Player */}
        <View style={styles.miniPlayer}>
          <TouchableOpacity 
            style={styles.miniPlayerMain}
            onPress={handleCardPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Uitklappen naar volledige speler"
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
                      { width: `${progress}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.miniPlayButton} 
            onPress={handlePlayPause}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "Pauzeer muziek" : "Speel muziek"}
          >
            {isPlaying ? (
              <Pause size={20} color="#333" fill="#333" />
            ) : (
              <Play size={20} color="#333" fill="#333" />
            )}
          </TouchableOpacity>
        </View>

        {/* Expanded Player */}
        <Animated.View style={[styles.expandedPlayer, expandedContentStyle]}>
          {/* Drag Handle */}
          <TouchableOpacity 
            style={styles.dragHandle} 
            onPress={handleBackdropPress}
            activeOpacity={0.7}
          />
          
          {/* Large Cover Art */}
          <Image 
            source={{ uri: currentTrack.coverUrl }} 
            style={styles.expandedCover}
          />
          
          {/* Track Info */}
          <Text style={styles.expandedTitle}>{currentTrack.title}</Text>
          <Text style={styles.expandedArtist}>Kinderen Muziek</Text>
          
          {/* Large Progress Bar */}
          <View style={styles.expandedProgressContainer}>
            <View style={styles.expandedProgressTrack}>
              <View 
                style={[
                  styles.expandedProgressFill, 
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {Math.floor((progress / 100) * 180)}s
              </Text>
              <Text style={styles.timeText}>3:00</Text>
            </View>
          </View>
          
          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handlePrevious}
              accessibilityRole="button"
              accessibilityLabel="Vorig nummer"
            >
              <SkipBack size={32} color="#333" fill="#333" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.playButtonLarge} 
              onPress={handlePlayPause}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? "Pauzeer muziek" : "Speel muziek"}
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
              accessibilityRole="button"
              accessibilityLabel="Volgend nummer"
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playerContainer: {
    backgroundColor: '#FEF7F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: EXPANDED_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  miniPlayerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 44,
  },
  miniCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  miniContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  miniProgressContainer: {
    width: '100%',
  },
  miniProgressTrack: {
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 1.5,
  },
  miniPlayButton: {
    width: 44, // 44pt hit target
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Expanded Player Styles
  expandedPlayer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#C0C0C0',
    borderRadius: 2,
    marginBottom: 30,
    alignSelf: 'center',
  },
  expandedCover: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  expandedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  expandedArtist: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  expandedProgressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  expandedProgressTrack: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  expandedProgressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  controlButton: {
    width: 64, // Larger than 44pt for better UX
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});