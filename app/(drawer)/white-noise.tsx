import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import TrackPlayer, { RepeatMode } from "react-native-track-player";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import BackHeader from "@/components/BackHeader";
import { applyMaxVolume } from "@/lib/volume";
import { usePlayer } from "@/contexts/PlayerContext";
import { supabase } from "@/lib/supabase";
import { buildMediaUrl } from "@/lib/queries";

type NoiseItem = {
  id: string;
  title: string;
  url: string | number;
};

type SongRow = {
  id: string;
  title: string;
  optimized_file: string | null;
};

type SongsTagRow = { songs: SongRow | null };
type TagMeta = { id: string; name: string | null; gradient_1: string | null; gradient_2: string | null };

export default function WhiteNoiseScreen() {
  const router = useRouter();
  const { setHidePlayerUI } = usePlayer();
  const [activeTitle, setActiveTitle] = React.useState<string | null>(null);
  const [loadingTitle, setLoadingTitle] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<NoiseItem[]>([]);
  const [tagMeta, setTagMeta] = React.useState<TagMeta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const stopPlayback = React.useCallback(async () => {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch {}
    setActiveTitle(null);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setHidePlayerUI(true);
      return () => {
        setHidePlayerUI(false);
        stopPlayback();
      };
    }, [setHidePlayerUI, stopPlayback])
  );


  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data: tagRow, error: tagError } = await supabase
        .from("tags")
        .select("id,name,gradient_1,gradient_2")
        .eq("id", "c79075b4-f1d1-40d2-a04c-79289a810b60")
        .maybeSingle();
      if (tagError) throw tagError;
      if (!tagRow?.id) {
        setItems([]);
        setTagMeta(null);
        setError("Geen categorie gevonden in Supabase.");
        return;
      }
      setTagMeta(tagRow as TagMeta);

      const { data, error: songsError } = await supabase
        .from("songs_tags")
        .select("songs(id,title,optimized_file)")
        .eq("tag_id", tagRow.id);
      if (songsError) throw songsError;

      const rows = (data ?? []) as SongsTagRow[];
      const list = rows
        .map((row) => row.songs)
        .filter((song): song is SongRow => !!song && !!song.optimized_file)
        .map((song) => ({
          id: song.id,
          title: song.title,
          url: buildMediaUrl(song.optimized_file, ".aac"),
        }))
        .filter((item) => !!item.url);

      if (__DEV__) {
        list.unshift({
          id: "local-test-wav",
          title: "Local Test WAV",
          url: require("../../assets/fara-pauza.wav"),
        });
      }

      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? "Kon de white noise lijst niet laden.");
      setItems([]);
      setTagMeta(null);
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
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

const startPlayback = async (item: NoiseItem) => {
  setLoadingTitle(item.title);
  try {
    if (__DEV__) {
      console.log("[white-noise] play url:", item.title, item.url);
    }
    // ASIGURĂ setup-ul playerului
    try {
      await TrackPlayer.getState();
    } catch {
      await TrackPlayer.setupPlayer();
    }

    await TrackPlayer.reset();

    await TrackPlayer.add({
      id: `white-noise-${item.id}`,
      url: item.url,
      title: item.title,
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Track);
    await TrackPlayer.play();
    await applyMaxVolume();

    setActiveTitle(item.title);
  } catch (e) {
    console.warn("white noise play error:", e);
    setActiveTitle(null);
  } finally {
    setLoadingTitle(null);
  }
};

  const toggleItem = async (item: NoiseItem, value: boolean) => {
    if (loadingTitle && loadingTitle !== item.title) return;
    if (!value) {
      if (activeTitle === item.title) {
        await stopPlayback();
      }
      return;
    }
    if (activeTitle && activeTitle !== item.title) {
      await stopPlayback();
    }
    await startPlayback(item);
  };

  const renderItem = ({ item }: { item: NoiseItem }) => {
    const isActive = activeTitle === item.title;
    return (
      <View style={styles.row}>
        <Switch
          value={isActive}
          onValueChange={(value) => toggleItem(item, value)}
          disabled={loadingTitle === item.title}
          trackColor={{ false: "#D6D6D6", true: "#4FBC80" }}
          thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
          ios_backgroundColor="#525050"
          accessibilityLabel={`${item.title} ${isActive ? "uit" : "aan"}`}
          style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] }}
        />
        <Text style={styles.rowTitle}>{item.title}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader onBack={() => router.replace("/")} />

      <View style={styles.categoryHeader}>
        <LinearGradient
          colors={[
            String(tagMeta?.gradient_1 ?? "#F4EFFA"),
            String(tagMeta?.gradient_2 ?? "#D8C3F4"),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryTitle}>{tagMeta?.name ?? "Witte ruis"}</Text>
        </LinearGradient>
      </View>

      <View style={{ height: 24 }} />
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Laden...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Geen geluiden gevonden voor deze categorie.
            </Text>
          }
        />
      )}
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
  categoryGradient: { width: "100%", paddingVertical: 16, paddingHorizontal: 20 },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#534F50",
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 18, paddingBottom: 20 },
  loadingWrap: { padding: 20, alignItems: "center" },
  loadingText: { marginTop: 8, color: "#666" },
  errorText: { color: "#B00020", textAlign: "center" },
  emptyText: { color: "#666", textAlign: "center", paddingTop: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 9,
    marginBottom: 12,
  },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#333", marginLeft: 20, },
});
