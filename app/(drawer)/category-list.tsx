// app/(...)/CategoryListScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
} from "react-native";
import BackHeader from "@/components/BackHeader";
import OverflowMenu from "@/components/OverflowMenu";
import { usePlayer } from "@/contexts/PlayerContext";
import TrackRow from "@/components/TrackRow";
import { LinearGradient } from 'expo-linear-gradient';

type ServerTrack = { title: string; url: string };

const ALL_SERVER_TRACKS: ServerTrack[] = [
  { title: "example 1", url: "https://aapscm.onllyons.com/muziek-song/1.mp3" },
  { title: "example 2", url: "https://aapscm.onllyons.com/muziek-song/2.mp3" },
  { title: "example 3", url: "https://aapscm.onllyons.com/muziek-song/3.mp3" },
  { title: "example 4", url: "https://aapscm.onllyons.com/muziek-song/4.mp3" },
  { title: "example 5", url: "https://aapscm.onllyons.com/muziek-song/5.mp3" },
];

export default function CategoryListScreen() {
  const { playFromList } = usePlayer();
  const TRACKS = ALL_SERVER_TRACKS;
  const COVER_URL = "https://aapscm.onllyons.com/muziek/player.png";

  const [overflowMenu, setOverflowMenu] = React.useState<{
    visible: boolean;
    songTitle: string;
    position: { x: number; y: number };
  }>({ visible: false, songTitle: "", position: { x: 0, y: 0 } });

  const handleOverflowPress = (
    song: string,
    anchor: { x: number; y: number }
  ) => {
    setOverflowMenu({ visible: true, songTitle: song, position: anchor });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />

      <View style={styles.categoryHeader}>
        <LinearGradient
          colors={['#FFF3A0', '#FFC464']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryTitle}>Overgang</Text>
        </LinearGradient>
      </View>

      <FlatList
        data={TRACKS}
        keyExtractor={(item, i) => `${item.title}-${i}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <TrackRow
            title={item.title}
            url={item.url}
            coverUrl={COVER_URL}
            onOverflowPress={handleOverflowPress}
            onPlay={() => playFromList(TRACKS, index, COVER_URL)}
          />
        )}
      />

      <OverflowMenu
        songTitle={overflowMenu.songTitle}
        visible={overflowMenu.visible}
        onClose={() =>
          setOverflowMenu((v) => ({ ...v, visible: false }))
        }
        anchorPosition={overflowMenu.position}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FEF7F5" },
  
  categoryHeader: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({ android: { elevation: 4 } }),
  },
  categoryGradient:{
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#534F50",
    textAlign: "center",
  },
  listContent: { paddingVertical: 8 },
});
