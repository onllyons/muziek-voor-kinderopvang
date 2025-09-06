import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Play, MoveVertical as MoreVertical } from 'lucide-react-native';
import BackHeader from '@/components/BackHeader';
import OverflowMenu from '@/components/OverflowMenu';
import { usePlayer } from '@/contexts/PlayerContext';
import TrackRow from '@/components/TrackRow';

const SONGS = [
  'Goedemorgen Zonnestraal',
  'Handjes Wassen Lied',
  'Smakelijk Eten Samen',
  'In de Kring',
  'Opruimen Maar!',
  'Hupsakee, Naar Buiten!',
  'Alle Kleuren van de Dag',
];

export default function CategoryListScreen() {
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

  const handleSongPress = (song: string) => {
    console.log('Song pressed:', song);
    // Set current track to show PlayerView
    setCurrentTrack({
      title: song,
      coverUrl: 'https://aapscm.onllyons.com/muziek/player.png'
    });
  };

  const handleOverflowPress = (song: string, event: any) => {
    const { pageY } = event.nativeEvent;
    setOverflowMenu({
      visible: true,
      songTitle: song,
      position: { x: 0, y: pageY },
    });
  };

  const closeOverflowMenu = () => {
    setOverflowMenu(prev => ({ ...prev, visible: false }));
  };



  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />
      
      {/* Sticky colored strip */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Overgang</Text>
      </View>

      <FlatList
        data={SONGS}
        keyExtractor={(item, i) => `${item}-${i}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TrackRow
            title={item}
            onPress={handleSongPress}
            onOverflowPress={handleOverflowPress}
          />
        )}
        showsVerticalScrollIndicator={false}
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
  container: {
    flex: 1,
    backgroundColor: '#FEF7F5',
  },
  categoryHeader: {
    backgroundColor: '#ffe36e',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcd6e',
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


});