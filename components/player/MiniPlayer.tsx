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
          
          <View style={styles.boxInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

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

      
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    flexDirection: "row",
    alignItems: "center",
    // paddingRight: 16,
    // paddingLeft: 12,
    // height: 120,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    flexGrow: 1,
    
    paddingLeft: 20,
    height: 120,
  },
  boxInfo: {
    flex: 1, 
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,

    height: 65,

    justifyContent: 'space-between',
    alignContent: 'center',


  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  title: { 
    fontSize: 15, 
    fontWeight: "500", 
    color: "#333", 
    marginBottom: 8 
  },
  progressArea: {
    
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
    marginRight: 20,
  },
  pressed: { opacity: 0.85 },
  pressedLight: { opacity: 0.9 },
});
