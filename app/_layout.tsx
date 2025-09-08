// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';

import { PlayerProvider } from '@/contexts/PlayerContext';
import PlayerView from '@/components/PlayerView';

// IMPORTANT: înregistrează playback service-ul o singură dată, la modul top-level.
// Presupunem că ai `app/service.ts` (adică același nivel cu `app/_layout.tsx`).
import playbackService from '../service';
TrackPlayer.registerPlaybackService(() => playbackService);

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // inițializează playerul (o singură dată)
        await TrackPlayer.setupPlayer({ waitForBuffer: true });

        await TrackPlayer.updateOptions({
          // capabilități afișate în lock screen / Control Center (iOS)
          // și în notificarea media (Android)
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
          },
          // poți adăuga aici iconițe custom pentru Android, dacă vrei
          // progressUpdateEventInterval: 2 (secunde), etc.
        });

        if (!cancelled) setReady(true);
      } catch (e) {
        console.warn('TrackPlayer setup/updateOptions error:', e);
        if (!cancelled) setReady(true); // nu bloca UI-ul
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    // Poți pune un splash / loader dacă vrei
    return null;
  }

  return (
    <PlayerProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* ajustează rutele după cum ai în proiect */}
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>

        {/* Player persistent pe toate ecranele */}
        <PlayerView />

        <StatusBar style="auto" />
      </View>
    </PlayerProvider>
  );
}
