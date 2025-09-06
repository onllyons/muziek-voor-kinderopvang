import React from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList } from "react-native";
import BackHeader from "@/components/BackHeader";
import OverflowMenu from "@/components/OverflowMenu";
import { usePlayer } from "@/contexts/PlayerContext";
import TrackRow from "@/components/TrackRow";

const ALL_SERVER_TRACKS = [
  {
    title: "example 1",
    url: "https://aapscm.onllyons.com/muziek-song/1.mp3",
  },
  {
    title: "example 2",
    url: "https://aapscm.onllyons.com/muziek-song/2.mp3",
  },
  {
    title: "example 3",
    url: "https://aapscm.onllyons.com/muziek-song/3.mp3",
  },
  {
    title: "example 4",
    url: "https://aapscm.onllyons.com/muziek-song/4.mp3",
  },
  {
    title: "example 5",
    url: "https://aapscm.onllyons.com/muziek-song/5.mp3",
  },
];

export default function CategoryListScreen() {
  const { setCurrentTrack } = usePlayer();
  const TRACKS = ALL_SERVER_TRACKS.slice(0, 4);
  const [overflowMenu, setOverflowMenu] = React.useState<{
    visible: boolean;
    songTitle: string;
    position: { x: number; y: number };
  }>({
    visible: false,
    songTitle: "",
    position: { x: 0, y: 0 },
  });

  const handleSongPress = (title: string) => {
    const t = TRACKS.find((x) => x.title === title);
    setCurrentTrack({
      title,
      audioUrl: t?.url, // păstrăm pentru viitor (chiar dacă acum e UI-only)
      coverUrl: "https://aapscm.onllyons.com/muziek/player.png", // sau cover local cu require(...)
    });
  };

  const handleOverflowPress = (
    song: string,
    anchor: { x: number; y: number }
  ) => {
    setOverflowMenu({ visible: true, songTitle: song, position: anchor });
  };

  const closeOverflowMenu = () => {
    setOverflowMenu((prev) => ({ ...prev, visible: false }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />

      {/* Sticky colored strip */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Overgang</Text>
      </View>

      <FlatList
        data={TRACKS}
        keyExtractor={(item, i) => `${item.title}-${i}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TrackRow
            title={item.title}
            onPress={handleSongPress}
            onOverflowPress={handleOverflowPress}
          />
        )}
      />

      <OverflowMenu
        songTitle={overflowMenu.songTitle}
        visible={overflowMenu.visible}
        onClose={() => setOverflowMenu((v) => ({ ...v, visible: false }))}
        anchorPosition={overflowMenu.position}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF7F5",
  },
  categoryHeader: {
    backgroundColor: "#ffe36e",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ffcd6e",
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#534F50",
    textAlign: "center",
  },
  listContent: {
    paddingVertical: 8,
  },
});
