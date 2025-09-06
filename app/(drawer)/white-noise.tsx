import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Play, MoveVertical as MoreVertical } from 'lucide-react-native';
import BackHeader from '@/components/BackHeader';
import OverflowMenu from '@/components/OverflowMenu';
import { usePlayer } from '@/contexts/PlayerContext';

const WHITE_NOISE_TRACKS = [
  'Regensound',
  'Oceaangolven',
  'Vogelgeluiden',
  'Zachte Wind',
  'Krekels',
  'Waterval',
  'Bos Geluiden',
];

export default function WhiteNoiseScreen() {
  const { setCurrentTrack } = usePlayer();
  const [overflowMenu, setOverflowMenu] = React.useState<{
    visible: boolean;
    songTitle: string;
    position: { x: number; y: number };
  }>({
    visible: false,
    songTitle: '',
    position: { x: 0, y: 0 },
  });

  const handleTrackPress = (track: string) => {
    console.log('White noise track pressed:', track);
    // Set current track to show PlayerView
    setCurrentTrack({
      title: track,
      coverUrl: 'https://aapscm.onllyons.com/muziek/player.png'
    });
  };

  const handleOverflowPress = (track: string, event: any) => {
    const { pageY } = event.nativeEvent;
    setOverflowMenu({
      visible: true,
      songTitle: track,
      position: { x: 0, y: pageY },
    });
  };

  const closeOverflowMenu = () => {
    setOverflowMenu(prev => ({ ...prev, visible: false }));
  };

  const renderTrackItem = ({ item }: { item: string }) => (
    <View style={styles.trackRow}>
      <TouchableOpacity 
        style={styles.trackMain}
        onPress={() => handleTrackPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`Speel ${item}`}
      >
        <View style={styles.playIconContainer}>
          <Play size={20} color="#666" fill="#666" />
        </View>
        <Text style={styles.trackTitle}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.overflowContainer}
        onPress={(event) => handleOverflowPress(item, event)}
        accessibilityRole="button"
        accessibilityLabel={`Meer opties voor ${item}`}
      >
        <MoreVertical size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />
      
      {/* Sticky colored strip */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Witte Ruis</Text>
      </View>

      <FlatList
        data={WHITE_NOISE_TRACKS}
        renderItem={renderTrackItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <OverflowMenu
        songTitle={overflowMenu.songTitle}
        visible={overflowMenu.visible}
        onClose={closeOverflowMenu}
        anchorPosition={overflowMenu.position}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7F5',
  },
  categoryHeader: {
    backgroundColor: '#e4dcfd',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#d2c4fa',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#534F50',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    minHeight: 64, // Ensures 44pt+ hit target
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trackMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 44,
  },
  playIconContainer: {
    width: 44, // 44pt hit target
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  trackTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  overflowContainer: {
    padding: 12, // 44pt hit target with padding
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});