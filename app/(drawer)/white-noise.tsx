import React from 'react';
import { View, Text, Platform, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import BackHeader from '@/components/BackHeader';
import { LinearGradient } from 'expo-linear-gradient';
import OverflowMenu from '@/components/OverflowMenu';
import { usePlayer } from '@/contexts/PlayerContext';
import TrackRow from '@/components/TrackRow';
import { useRouter } from "expo-router";

const WHITE_NOISE_TRACKS = [
  'Regensound','Oceaangolven','Vogelgeluiden','Zachte Wind','Krekels','Waterval','Bos Geluiden',
];

const COVER = 'https://aapscm.onllyons.com/muziek/player.png';
const URLS_BY_TITLE: Record<string, string> = {
};

export default function WhiteNoiseScreen() {
  const { playFromList } = usePlayer();
  const router = useRouter();
  const [overflowMenu, setOverflowMenu] = React.useState({
    visible: false,
    track: null as null | { title: string; audioUrl?: string; coverUrl: string | number },
    position: { x: 0, y: 0 },
  });


  const list = React.useMemo(
    () => WHITE_NOISE_TRACKS.map((title) => ({ title, url: URLS_BY_TITLE[title] ?? '' })),
    []
  );

  const handlePlayAt = (title: string) => {
    const index = list.findIndex((t) => t.title === title);
    if (index < 0) return;
    playFromList(list, index, COVER).catch(() => {});
  };

  const handleOverflowPress = (title: string, anchor: { x: number; y: number }) => {
    setOverflowMenu({ visible: true, songTitle: title, position: anchor });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader onBack={() => router.replace("/(drawer)/index")} />

      <View style={styles.categoryHeader}>
        <LinearGradient
          colors={['#F4EFFA', '#D8C3F4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryTitle}>Witte Ruis</Text>
        </LinearGradient>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item, i) => `${item.title}-${i}`}
        renderItem={({ item }) => (
          <TrackRow
            title={item.title}
            coverUrl={COVER}
            url={item.url}
            onPlay={() => handlePlayAt(item.title)}
            onOverflowPress={(_, anchor) =>
              setOverflowMenu({
                visible: true,
                track: { title: item.title, audioUrl: item.url, coverUrl: COVER },
                position: anchor,
              })
            }
          />
        )}
      />


      <OverflowMenu
        track={overflowMenu.track!}
        visible={overflowMenu.visible}
        onClose={() => setOverflowMenu(v => ({ ...v, visible: false }))}
        anchorPosition={overflowMenu.position}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF7F5' },
  categoryHeader: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({ android: { elevation: 4 } }),
  },
  categoryGradient: { width: '100%', paddingVertical: 16, paddingHorizontal: 20 },
  categoryTitle: { fontSize: 18, fontWeight: '600', color: '#534F50', textAlign: 'center' },
  listContent: { paddingVertical: 8 },
});
