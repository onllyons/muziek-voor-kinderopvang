import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
} from "react-native-track-player";

import { PlayerProvider } from "@/contexts/PlayerContext";
import PlayerView from "@/components/PlayerView";
import { loadAndApplyMaxVolume } from "@/lib/volume";
import playbackService from "../service";

TrackPlayer.registerPlaybackService(() => playbackService);

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await TrackPlayer.setupPlayer({ waitForBuffer: true });

        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.ContinuePlayback,
          },
        });

        if (!cancelled) setReady(true);
        loadAndApplyMaxVolume();
      } catch (e) {
        console.warn("TrackPlayer setup/updateOptions error:", e);
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <PlayerView />
          <StatusBar style="auto" />
        </View>
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}
