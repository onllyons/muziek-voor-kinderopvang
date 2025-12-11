import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import BackHeader from "@/components/BackHeader";
import { usePlayer } from "@/contexts/PlayerContext";
import TrackRow from "@/components/TrackRow";
import { gqlFetch, edgesToArray } from "@/lib/gql";
import { SONGS_BY_TAG_ID } from "@/lib/queries-graphql";
import { runQ } from "@/lib/network-queue";
import { SearchContext } from "../_layout";
import SearchResults from "@/components/SearchResults";
import { B2_PUBLIC_URL, DEFAULT_COVER, buildMediaUrl } from "@/lib/queries";

type Song = { id: string; title: string; optimized_file: string | null; cover_file?: string | null };
type Resp = { songs_tagsCollection: { edges: { node: { songs: Song } }[] } };

export default function SongsByTagScreen() {
  const router = useRouter();
  const { results } = React.useContext(SearchContext);
  const { playFromList } = usePlayer();
  const { id, name, g1, g2, origin } = useLocalSearchParams<{
    id: string;
    name?: string;
    g1?: string;
    g2?: string;
    origin?: "themes" | "home";
  }>();

  const [tracks, setTracks] = React.useState<
    { title: string; url: string; coverUrl?: string | number }[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await runQ(() =>
        gqlFetch<Resp>(SONGS_BY_TAG_ID, { tagId: id })
      );
      const nodes = edgesToArray<{ songs: Song }>(data.songs_tagsCollection);
      const mapped = nodes
        .map((n) => n.songs)
        .filter((s) => !!s.optimized_file)
        .map((s) => ({
          title: s.title,
          url: `${B2_PUBLIC_URL}${s.optimized_file}.aac`,
          coverUrl: s.cover_file
            ? buildMediaUrl(s.cover_file, ".png")
            : DEFAULT_COVER,
        }));
      setTracks(mapped);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  const onBack = () => {
    if (origin === "themes") router.replace("/themes");
    else router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <BackHeader onBack={onBack} />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading songs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>

    {results.length > 0 ? (
        <SearchResults results={results} />
      ) : (

        <View style={{ flex: 1 }}>

      <BackHeader onBack={onBack} />

      <View style={s.categoryHeader}>
        <LinearGradient
          colors={[String(g1 ?? "#86EABA"), String(g2 ?? "#4FBC80")]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.categoryGradient}
        >
          <Text style={s.categoryTitle}>{name ?? "Tag"}</Text>
        </LinearGradient>
      </View>

      {!!error && (
        <Text style={{ color: "#B00020", margin: 12, textAlign: "center" }}>
          {error}
        </Text>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item, i) => `${item.title}-${i}`}
        contentContainerStyle={s.listContent}
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
            coverUrl={item.coverUrl ?? DEFAULT_COVER}
            onPlay={() =>
              playFromList(
                tracks.map((t) => ({
                  title: t.title,
                  url: t.url,
                  coverUrl: t.coverUrl,
                })),
                index,
                DEFAULT_COVER
              )
            }
          />
        )}
      />
      </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
