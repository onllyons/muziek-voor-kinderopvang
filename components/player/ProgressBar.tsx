import React, { useCallback, useState } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { clamp } from "@/lib/time";

type Props = {
  positionSec: number;
  durationSec: number;
  onSeek: (newPositionSec: number) => void;
  liveWhileDragging?: boolean;
  liveThrottleMs?: number;
  onScrubStart?: () => void;
  onScrubEnd?: (finalSec: number) => void;
  onPreviewChange?: (sec: number | null) => void;
  trackHeight?: number;
  knobSize?: number;
  knobOffsetY?: number;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
  debugTag?: string;
  interactive?: boolean;
};

const dlog = (...args: any[]) => {
  if (__DEV__) console.log(...args);
};

export default function ProgressBar({
  positionSec,
  durationSec,
  onSeek,
  liveWhileDragging = false,
  liveThrottleMs = 120,
  onPreviewChange,
  onScrubStart,
  onScrubEnd,
  trackHeight = 6,
  knobSize = 20,
  knobOffsetY = 0,
  containerStyle,
  accessibilityLabel = "Bara de progres",
  debugTag = "PB",
  interactive = true,
}: Props) {
  const [trackW, setTrackW] = useState(0);
  const trackWSV = useSharedValue(0);
  const dragging = useSharedValue(false);
  const previewSec = useSharedValue(0);
  const lastLiveTs = useSharedValue(0);
  const lastLogTs = useSharedValue(0);

  const displayedX = useSharedValue(0);
  const fillW = useSharedValue(0);

  const holdUntilRef = React.useRef(0);
  const targetRef = React.useRef<number | null>(null);

  const toX = useCallback(
    (sec: number) => {
      if (durationSec <= 0 || trackW <= 0) return 0;
      const pct = clamp(sec / durationSec, 0, 1);
      return clamp(
        pct * (trackW - knobSize),
        0,
        Math.max(0, trackW - knobSize)
      );
    },
    [durationSec, trackW, knobSize]
  );

  React.useEffect(() => {
    if (dragging.value) return;
    const now = Date.now();
    if (targetRef.current != null) {
      const delta = Math.abs(positionSec - targetRef.current);
      if (delta > 0.5 && now < holdUntilRef.current) {
        dlog(
          `[${debugTag}] IGNORE ext pos during hold: pos=${positionSec.toFixed(
            2
          )} target=${targetRef.current.toFixed(2)}`
        );
        return;
      }
      if (delta <= 0.5 || now >= holdUntilRef.current) {
        dlog(
          `[${debugTag}] RELEASE hold: pos=${positionSec.toFixed(
            2
          )} target=${targetRef.current?.toFixed(2)}`
        );
        targetRef.current = null;
        holdUntilRef.current = 0;
      }
    }
    const x = toX(positionSec);
    displayedX.value = x;
    fillW.value = Math.max(0, Math.min(x + knobSize / 2, trackW));
  }, [positionSec, trackW, knobSize, toX]);

  const onLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    setTrackW(w);
    trackWSV.value = w;
    const x = toX(positionSec);
    displayedX.value = x;
    fillW.value = Math.max(0, Math.min(x + knobSize / 2, w));
    dlog(`[${debugTag}] onLayout width=${w}`);
  };

  const tap = Gesture.Tap().onStart((e) => {
    if (trackWSV.value <= 0 || durationSec <= 0) return;
    const maxX = Math.max(0, trackWSV.value - knobSize);
    const localX = Math.max(0, Math.min(e.x - knobSize / 2, maxX));
    const denom = Math.max(1, maxX);
    const pct = denom > 0 ? localX / denom : 0;
    const sec = pct * durationSec;

    displayedX.value = localX;
    fillW.value = Math.max(0, Math.min(localX + knobSize / 2, trackWSV.value));

    targetRef.current = sec;
    holdUntilRef.current = Date.now() + 700;

    if (onScrubStart) runOnJS(onScrubStart)();
    if (onScrubEnd) runOnJS(onScrubEnd)(sec);

    runOnJS(dlog)(
      `[${debugTag}] TAP → sec=${sec.toFixed(2)} / dur=${durationSec.toFixed(
        2
      )} x=${localX.toFixed(1)}/${trackWSV.value.toFixed(1)}`
    );
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragging.value = true;
      previewSec.value = positionSec;
      if (onScrubStart) runOnJS(onScrubStart)();
      runOnJS(dlog)(
        `[${debugTag}] PAN begin pos=${positionSec.toFixed(
          2
        )} dur=${durationSec.toFixed(2)}`
      );
      if (onPreviewChange) runOnJS(onPreviewChange)(positionSec);
    })
    .onChange((e) => {
      if (trackWSV.value <= 0 || durationSec <= 0) return;

      const maxX = Math.max(0, trackWSV.value - knobSize);
      const nextX = Math.max(0, Math.min(displayedX.value + e.changeX, maxX));

      displayedX.value = nextX;
      fillW.value = Math.max(0, Math.min(nextX + knobSize / 2, trackWSV.value));

      const denom = Math.max(1, maxX);
      const pct = denom > 0 ? nextX / denom : 0;
      const sec = pct * durationSec;
      previewSec.value = sec;

      const now = Date.now();
      if (now - lastLogTs.value > 200) {
        lastLogTs.value = now;
        runOnJS(dlog)(
          `[${debugTag}] PAN move sec=${sec.toFixed(2)} x=${nextX.toFixed(
            1
          )}/${trackWSV.value.toFixed(1)}`
        );
      }

      if (onPreviewChange) runOnJS(onPreviewChange)(sec);
      if (liveWhileDragging) {
        if (now - lastLiveTs.value >= liveThrottleMs) {
          lastLiveTs.value = now;
          runOnJS(onSeek)(sec);
        }
      }
    })
    .onEnd(() => {
      dragging.value = false;
      const sec = previewSec.value;
      targetRef.current = sec;
      holdUntilRef.current = Date.now() + 700;
      if (onScrubEnd) runOnJS(onScrubEnd)(sec);
      runOnJS(dlog)(`[${debugTag}] PAN end → final ${sec.toFixed(2)}`);

      if (onPreviewChange) runOnJS(onPreviewChange)(null);
    });

  const composed = React.useMemo(() => {
    const tapG = tap.enabled(interactive);
    const panG = pan.enabled(interactive);
    return Gesture.Simultaneous(tapG, panG);
  }, [interactive, tap, pan]);

  const fillStyle = useAnimatedStyle(() => ({ width: fillW.value }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: displayedX.value },
      { translateY: -(knobSize / 2 - trackHeight / 2) + knobOffsetY },
    ],
  }));

  return (
    <View
      onLayout={onLayout}
      style={[styles.wrap, containerStyle]}
      accessible
      accessibilityRole={interactive ? "adjustable" : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !interactive || undefined }}
      accessibilityValue={
        interactive
          ? {
              now: Math.round((positionSec / (durationSec || 1)) * 100),
              min: 0,
              max: 100,
            }
          : undefined
      }
    >
      <GestureDetector gesture={composed}>
        <View style={styles.row} pointerEvents={interactive ? "auto" : "none"}>
          <View style={[styles.track, { height: trackHeight }]}>
            <Animated.View
              style={[styles.fill, { borderRadius: trackHeight }, fillStyle]}
            />
          </View>
          <Animated.View
            style={[
              styles.knob,
              { width: knobSize, height: knobSize, borderRadius: knobSize / 2 },
              knobStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", justifyContent: "center" },
  row: { width: "100%", justifyContent: "center" },
  track: { backgroundColor: "#FFFFFF", borderRadius: 10 },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FF6B81",
  },
  knob: {
    position: "absolute",
    backgroundColor: "#FF6B81",
    borderWidth: 2,
    borderColor: "white",
  },
});
