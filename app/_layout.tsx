import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { PlayerProvider } from '@/contexts/PlayerContext';
import PlayerView from '@/components/PlayerView';
import useSetupTrackPlayer from '@/hooks/useSetupTrackPlayer';

import TrackPlayer from 'react-native-track-player';
import playbackService from '../service';

// înregistrezi service-ul OBLIGATORIU
TrackPlayer.registerPlaybackService(() => playbackService);

export default function RootLayout() {
  const ready = useSetupTrackPlayer(); // <- initializează TrackPlayer

  if (!ready) return null; // sau un splash screen mic

  return (
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
  );
}
