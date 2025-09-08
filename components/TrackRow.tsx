// components/TrackRow.tsx
import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Play, Pause, MoreVertical } from "lucide-react-native";
import { usePlayer } from "@/contexts/PlayerContext";

type Props = {
  title: string;
  url: string;
  coverUrl: string | number;
  onOverflowPress: (title: string, anchor: { x: number; y: number }) => void;
  onPlay: () => void; // nou: pornește playback din listă
};

function TrackRowBase({ title, url, coverUrl, onOverflowPress, onPlay }: Props) {
  const { currentTrack, isPlaying, togglePlay } = usePlayer();
  const isCurrent = currentTrack?.title === title;

  const handleRowPress = async () => {
    if (isCurrent) {
      await togglePlay();
    } else {
      onPlay();
    }
  };

  const handlePlayIconPress = handleRowPress;

  const handleOverflow = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    onOverflowPress(title, { x: pageX, y: pageY });
  };

  return (
    <View style={s.row}>
      <TouchableOpacity
        style={s.main}
        onPress={handleRowPress}
        accessibilityRole="button"
        accessibilityLabel={`Speel ${title}`}
        activeOpacity={0.8}
      >
        <TouchableOpacity
          style={s.playBtn}
          onPress={handlePlayIconPress}
          activeOpacity={0.8}
        >
          {isCurrent && isPlaying ? (
            <Pause size={33} color="#534F50" fill="#534F50" />
          ) : (
            <Play size={33} color="#534F50" fill="#534F50" />
          )}
        </TouchableOpacity>
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.more}
        onPress={handleOverflow}
        accessibilityRole="button"
        accessibilityLabel={`Meer opties voor ${title}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MoreVertical size={20} color="#534F50" />
      </TouchableOpacity>
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
  },
});
