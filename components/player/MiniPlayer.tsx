import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Play, Pause } from "lucide-react-native";
import ProgressBar from "./ProgressBar";
import { formatTime } from "@/lib/time";

type Props = {
  title: string;
  coverSource: any;
  position: number;
  duration: number;
  showPause: boolean;
  onTogglePlay: () => void;
  onOpen: () => void;
  onSeek: (newPos: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: (sec: number) => void;
  enableScrub?: boolean;
};

export default function MiniPlayer({
  title,
  coverSource,
  position,
  duration,
  showPause,
  onTogglePlay,
  onOpen,
  onSeek,
  onScrubStart,
  onScrubEnd,
  enableScrub = false,
}: Props) {
  const elapsed = formatTime(position);
  const remaining =
    duration > 0 ? `-${formatTime(Math.max(0, duration - position))}` : "-0:00";

  return (
    <View style={styles.miniPlayer}>
      <Pressable
        style={({ pressed }) => [styles.left, pressed && styles.pressed]}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Deschide playerul pentru ${title}`}
        hitSlop={6}
      >
        <Image source={coverSource} style={styles.cover} />
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.playBtn,
          pressed && styles.pressedLight,
        ]}
        onPress={onTogglePlay}
        accessibilityRole="button"
        accessibilityLabel={showPause ? "Pauză" : "Redă"}
        hitSlop={8}
      >
        {showPause ? (
          <Pause size={33} color="#FF6B81" fill="#FF6B81" />
        ) : (
          <Play size={33} color="#FF6B81" fill="#FF6B81" />
        )}
      </Pressable>

      <View style={styles.progressArea} pointerEvents="box-none">
        <ProgressBar
          positionSec={position}
          durationSec={duration}
          onSeek={onSeek}
          liveWhileDragging={false}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
          interactive={enableScrub}
          knobSize={17}
          trackHeight={6}
          knobOffsetY={5}
          debugTag="mini"
        />

        <View style={styles.timeRow}>
          <Text style={styles.time}>{elapsed}</Text>
          <Text style={styles.time}>{remaining}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    paddingLeft: 12,
    height: 120,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    flexGrow: 1,
    backgroundColor: 'green',
    marginRight: 8,
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  meta: { 
    flex: 1, 
    marginLeft: 12, 
    marginRight: 8, 
    minWidth: 0 
  },
  title: { 
    fontSize: 15, 
    fontWeight: "500", 
    color: "#333", 
    marginBottom: 8 
  },
  progressArea: {
    position: "absolute",
    left: 12 + 64 + 12,
    right: 16 + 64 + 8,
    bottom: 16,
  },
  timeRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: { fontSize: 12, color: "#505050" },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  pressed: { opacity: 0.85 },
  pressedLight: { opacity: 0.9 },
});
