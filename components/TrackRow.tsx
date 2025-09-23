import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
  Pressable,
  AccessibilityState,
} from "react-native";
import { Play, Pause, MoreVertical, Heart } from "lucide-react-native";
import { usePlayer } from "@/contexts/PlayerContext";

type Props = {
  title: string;
  coverUrl?: string | number;
  url?: string;
  onPlay: () => void;

  onOverflowPress?: (title: string, anchor: { x: number; y: number }) => void;
  onRemoveFavorite?: (title: string) => void;
};

function TrackRowBase({
  title,
  onPlay,
  onOverflowPress,
  onRemoveFavorite,
}: Props) {
  const { currentTrack, isPlaying, uiIntendsToPlay, togglePlay } = usePlayer();
  const isCurrent = currentTrack?.title === title;

  const handlePlayPress = async () => {
    if (isCurrent) await togglePlay();
    else onPlay();
  };

  const handleOverflow = (e: GestureResponderEvent) => {
    if (!onOverflowPress) return;
    const { pageX, pageY } = e.nativeEvent;
    onOverflowPress(title, { x: pageX, y: pageY });
  };

  const handleRemove = () => {
    if (onRemoveFavorite) onRemoveFavorite(title);
  };

  const showPause = isCurrent && (isPlaying || uiIntendsToPlay);

  const a11yState: AccessibilityState = {
    selected: isCurrent || undefined,
    busy: (isCurrent && showPause) || undefined,
  };

  return (
    <View style={s.row}>
      <View style={s.main}>
        <Pressable
          style={({ pressed }) => [s.playBtn, pressed && s.pressedLight]}
          onPress={handlePlayPress}
          accessibilityRole="button"
          accessibilityLabel={
            isCurrent ? (showPause ? "Pause" : "Play") : "Play"
          }
          accessibilityState={a11yState}
          hitSlop={8}
        >
          {showPause ? (
            <Pause size={33} color="#534F50" fill="#534F50" />
          ) : (
            <Play size={33} color="#534F50" fill="#534F50" />
          )}
        </Pressable>

        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/*
      {onRemoveFavorite ? (
        <Pressable
          style={({ pressed }) => [s.more, pressed && s.pressedLight]}
          onPress={handleRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${title} din favorite`}
          hitSlop={8}
        >
          <Heart size={20} color="#e77b7b" fill="#e77b7b" />
        </Pressable>
      ) : onOverflowPress ? (
        <Pressable
          style={({ pressed }) => [s.more, pressed && s.pressedLight]}
          onPress={handleOverflow}
          accessibilityRole="button"
          accessibilityLabel={`Mai multe opțiuni pentru ${title}`}
          hitSlop={8}
        >
          <MoreVertical size={20} color="#534F50" />
        </Pressable>
      ) : null}
      */}
      
    </View>
  );
}

export default memo(TrackRowBase);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 64,
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minHeight: 44,
  },
  playBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 40,
    borderRadius: 22,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: "#1E1E1E",
    fontWeight: "500",
  },
  more: {
    padding: 12,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  pressedLight: { opacity: 0.9 },
});
