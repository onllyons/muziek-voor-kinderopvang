import React from "react";
import {
  View, Text, StyleSheet, SafeAreaView, Platform, FlatList,
} from "react-native";
import BackHeader from "@/components/BackHeader";
import { LinearGradient } from "expo-linear-gradient";
import { usePlayer } from "@/contexts/PlayerContext";
import TrackRow from "@/components/TrackRow";
import { Heart } from 'lucide-react-native';

export default function FavorietenScreen() {
  const { favorites, playFromList, removeFromFavorites } = usePlayer();
  const trackList = favorites;
  const handlePlayAt = (title: string) => {
    const index = trackList.findIndex(t => t.title === title);
    if (index < 0) return;
    const list = trackList.map(t => ({ title: t.title, url: t.audioUrl! })).filter(t => !!t.url);
    playFromList(list, index, trackList[index].coverUrl).catch(() => {});
  };

  const renderItem = ({ item }: { item: import("@/contexts/PlayerContext").Track }) => (
    <TrackRow
      title={item.title}
      coverUrl={item.coverUrl}
      url={item.audioUrl}
      onPlay={() => handlePlayAt(item.title)}
      onRemoveFavorite={(t) => removeFromFavorites(t)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.illustrationContainer}>
        <Heart size={80} color="#e0e0e0" />
      </View>
      <Text style={styles.emptyTitle}>Nog geen favorieten</Text>
      <Text style={styles.emptySubtitle}>
        Voeg liedjes toe aan je favorieten door op het ⋮ menu te tikken
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />

      <View style={styles.categoryHeader}>
        <LinearGradient
          colors={["#ffa3a3", "#ff6868"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryTitle}>Favorieten</Text>
        </LinearGradient>
      </View>

      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, i) => `${item.title}-${i}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  categoryTitle: { fontSize: 18, fontWeight: "600", color: "#534F50", textAlign: "center" },
  listContent: { paddingVertical: 8 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  illustrationContainer: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 12, textAlign: "center" },
  emptySubtitle: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 24 },
});
