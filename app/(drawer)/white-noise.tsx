import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import BackHeader from '@/components/BackHeader';
import OverflowMenu from '@/components/OverflowMenu';
import { usePlayer } from '@/contexts/PlayerContext';
import TrackRow from '@/components/TrackRow';

const WHITE_NOISE_TRACKS = [
  'Regensound','Oceaangolven','Vogelgeluiden','Zachte Wind','Krekels','Waterval','Bos Geluiden',
];

export default function WhiteNoiseScreen() {
  const { setCurrentTrack } = usePlayer();
  const [overflowMenu, setOverflowMenu] = React.useState({
    visible: false,
    songTitle: '',
    position: { x: 0, y: 0 },
  });

  const handleTrackPress = (title: string) => {
    setCurrentTrack({
      title,
      coverUrl: 'https://aapscm.onllyons.com/muziek/player.png',
    });
  };

  const handleOverflowPress = (title: string, anchor: { x: number; y: number }) => {
    setOverflowMenu({ visible: true, songTitle: title, position: anchor });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />

      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Witte Ruis</Text>
      </View>

      <FlatList
        data={WHITE_NOISE_TRACKS}
        keyExtractor={(item, i) => `${item}-${i}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TrackRow
            title={item}
            onPress={handleTrackPress}
            onOverflowPress={handleOverflowPress}
          />
        )}
      />

      <OverflowMenu
        songTitle={overflowMenu.songTitle}
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
    backgroundColor: '#e4dcfd',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#d2c4fa',
  },
  categoryTitle: { fontSize: 20, fontWeight: 'bold', color: '#534F50', textAlign: 'center' },
  listContent: { paddingVertical: 8 },
});
