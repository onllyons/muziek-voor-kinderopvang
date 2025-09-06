import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PlayerProvider } from '@/contexts/PlayerContext';
import PlayerView from '@/components/PlayerView';

export default function RootLayout() {
  useFrameworkReady();

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