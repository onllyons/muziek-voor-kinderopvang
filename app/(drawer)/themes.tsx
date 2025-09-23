import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BackHeader from "@/components/BackHeader";
import { usePlayer } from "@/contexts/PlayerContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { SearchContext } from "./_layout";
import SearchResults from "@/components/SearchResults";

type Tag = {
  id: string | number;
  name: string;
  gradient_1: string | null;
  gradient_2: string | null;
  sort_order: number | null;
};

export default function ThemesScreen() {
  const { setFilter } = usePlayer();
  const router = useRouter();
  const { results } = useContext(SearchContext); // 👈 aici primești results

  const [tags, setTags] = React.useState<Tag[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, gradient_1, gradient_2, sort_order, is_searchable")
        .eq("is_searchable", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setTags((data ?? []) as Tag[]);
    } catch (e: any) {
      setError(e?.message ?? "Could not load assignments");
      setTags([]);
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

  const renderThemeItem = ({ item }: { item: Tag }) => {
    const colors: [string, string] = [
      item.gradient_2 ?? "#CCCCCC",
      item.gradient_1 ?? "#999999",
    ];

    return (
      <TouchableOpacity
        style={styles.pillWrapper}
        onPress={() =>
          router.push({
            pathname: "/tag/[id]",
            params: {
              id: String(item.id),
              name: item.name,
              g1: item.gradient_1 ?? "#86EABA",
              g2: item.gradient_2 ?? "#4FBC80",
              origin: "themes",
            },
          })
        }
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Choose the theme ${item.name}`}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0.1 }}
          end={{ x: 1, y: 0.9 }}
          style={styles.pill}
        >
          <Text style={styles.pillText}>{item.name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {results.length > 0 ? (
        <SearchResults results={results} />
      ) : (
        <View style={{ flex: 1 }}>
          <BackHeader onBack={() => router.replace("/")} />

          <View style={styles.categoryHeader}>
            <LinearGradient
              colors={["#86EABA", "#4FBC80"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.categoryGradient}
            >
              <Text style={styles.categoryTitle}>Overgang</Text>
            </LinearGradient>
          </View>

          {loading ? (
            <View
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <ActivityIndicator />
              <Text style={{ marginTop: 8 }}>Loading...</Text>
            </View>
          ) : (
            <>
              {!!error && (
                <Text
                  style={{ color: "#B00020", margin: 12, textAlign: "center" }}
                >
                  {error}
                </Text>
              )}
              <FlatList
                style={{ marginTop: 30 }}
                data={tags}
                renderItem={renderThemeItem}
                keyExtractor={(item) => String(item.id)}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={{ textAlign: "center", marginTop: 24 }}>
                    Nu există teme disponibile.
                  </Text>
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const PILL_HEIGHT = 60;
const PILL_RADIUS = 16;

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
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
  },
  row: { justifyContent: "space-between", marginTop: 18 },
  pillWrapper: {
    flex: 1,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({ android: { elevation: 4 } }),
  },
  pill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    ...Platform.select({ android: { elevation: 8 } }),
  },
  pillText: { fontSize: 18, fontWeight: "600", color: "#534F50" },
});
