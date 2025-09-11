import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react-native";
import ProgressBar from "./ProgressBar";
import BackHeader from "@/components/BackHeader";
import { formatTime } from "@/lib/time";

type Props = {
  title: string;
  coverSource: any;
  position: number;
  duration: number;
  onSeek: (newPos: number) => void;
  showPause: boolean;
  onTogglePlay: () => void;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onScrubStart?: () => void;
  onScrubEnd?: (finalSec: number) => void;
};

export default function ExpandedPlayer({
  title,
  coverSource,
  position,
  duration,
  onSeek,
  showPause,
  onTogglePlay,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onClose,
  onScrubStart,
  onScrubEnd,
}: Props) {
  const elapsed = formatTime(position);
  const remaining =
    duration > 0 ? `-${formatTime(Math.max(0, duration - position))}` : "-0:00";

  return (
    <View style={{ flex: 1 }}>
      <BackHeader onBack={onClose} />

      <View style={styles.center}>
        <Image source={coverSource} style={styles.cover} />
        <Text style={styles.title}>{title}</Text>

        <View style={styles.progressWrap}>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{elapsed}</Text>
            <Text style={styles.time}>{remaining}</Text>
          </View>

          <ProgressBar
            positionSec={position}
            durationSec={duration}
            onSeek={onSeek}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
            knobSize={20}
            trackHeight={6}
            knobOffsetY={7}
            debugTag="expanded"
          />
        </View>

        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [
              styles.ctrlBtn,
              pressed && styles.pressedLight,
              !canPrev && { opacity: 0.4 },
            ]}
            onPress={onPrev}
            disabled={!canPrev}
            accessibilityRole="button"
            accessibilityLabel="Piesa anterioară"
          >
            <SkipBack size={32} color="#FF6B81" fill="#FF6B81" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.playLg,
              pressed && styles.pressedLight,
            ]}
            onPress={onTogglePlay}
            accessibilityRole="button"
            accessibilityLabel={showPause ? "Pauză" : "Redă"}
          >
            {showPause ? (
              <Pause size={40} color="#FF6B81" fill="#FF6B81" />
            ) : (
              <Play size={40} color="#FF6B81" fill="#FF6B81" />
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.ctrlBtn,
              pressed && styles.pressedLight,
              !canNext && { opacity: 0.4 },
            ]}
            onPress={onNext}
            disabled={!canNext}
            accessibilityRole="button"
            accessibilityLabel="Piesa următoare"
          >
            <SkipForward size={32} color="#FF6B81" fill="#FF6B81" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", paddingHorizontal: 32, paddingTop: 20 },
  cover: {
    width: 258,
    height: 258,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1E1E1E",
    textAlign: "center",
  },
  progressWrap: { width: "100%", marginTop: 70, marginBottom: 40 },
  timeRow: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: { fontSize: 14, color: "#666" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  ctrlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  playLg: {
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
  pressedLight: { opacity: 0.9 },
});
