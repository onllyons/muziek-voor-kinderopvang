import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import BackHeader from "@/components/BackHeader";
import OverflowMenu from "@/components/OverflowMenu";
import { usePlayer } from "@/contexts/PlayerContext";
import TrackRow from "@/components/TrackRow";
import { LinearGradient } from "expo-linear-gradient";
import { fetchTracks, ServerTrack } from "@/lib/queries";

export default function CategoryListScreen() {
  const { playFromList } = usePlayer();

  const COVER_URL = "https://aapscm.onllyons.com/muziek/player.png";
  const [tracks, setTracks] = React.useState<ServerTrack[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [overflowMenu, setOverflowMenu] = React.useState({
    visible: false,
    track: null as null | {
      title: string;
      audioUrl?: string;
      coverUrl: string | number;
    },
    position: { x: 0, y: 0 },
  });

  const handleOverflowPress = (
    songTitle: string,
    anchor: { x: number; y: number }
  ) => {
    const item = tracks.find((t) => t.title === songTitle);
    setOverflowMenu({
      visible: true,
      track: { title: songTitle, audioUrl: item?.url, coverUrl: COVER_URL },
      position: anchor,
    });
  };

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const data = await fetchTracks();
      setTracks(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchTracks();
      setTracks(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <BackHeader />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading songs</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />

      <View style={styles.categoryHeader}>
        <LinearGradient
          colors={["#FFF3A0", "#FFC464"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryTitle}>All songs</Text>
        </LinearGradient>
      </View>

      {!!error && <Text style={{ color: "#B00020", margin: 12 }}>{error}</Text>}

      <FlatList
        data={tracks}
        keyExtractor={(item, i) => `${item.title}-${i}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 24 }}>
            No songs found.
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item, index }) => (
          <TrackRow
            title={item.title}
            url={item.url}
            coverUrl={COVER_URL}
            onOverflowPress={handleOverflowPress}
            onPlay={() =>
              playFromList(
                tracks.map((t) => ({ title: t.title, url: t.url })),
                index,
                COVER_URL
              )
            }
          />
        )}
      />

      <OverflowMenu
        track={overflowMenu.track}
        visible={overflowMenu.visible}
        onClose={() => setOverflowMenu((v) => ({ ...v, visible: false }))}
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
  categoryGradient: {
    width: "100%",
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
