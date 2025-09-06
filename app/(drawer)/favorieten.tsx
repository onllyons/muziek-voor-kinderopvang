import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Play, MoveVertical as MoreVertical, Heart } from 'lucide-react-native';
import BackHeader from '@/components/BackHeader';
import { usePlayer } from '@/contexts/PlayerContext';

export default function FavorietenScreen() {
  const { favorites, setCurrentTrack, removeFromFavorites } = usePlayer();

  const handleSongPress = (song: string) => {
    console.log('Favorite song pressed:', song);
    // Set current track to show PlayerView
    setCurrentTrack({
      title: song,
      coverUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    });
  };

  const handleRemoveFromFavorites = (song: string) => {
    removeFromFavorites(song);
  };

  const renderSongItem = ({ item }: { item: string }) => (
    <View style={styles.songRow}>
      <TouchableOpacity 
        style={styles.songMain}
        onPress={() => handleSongPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`Speel ${item}`}
      >
        <View style={styles.playIconContainer}>
          <Play size={20} color="#666" fill="#666" />
        </View>
        <Text style={styles.songTitle}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.overflowContainer}
        onPress={() => handleRemoveFromFavorites(item)}
        accessibilityRole="button"
        accessibilityLabel={`Verwijder ${item} uit favorieten`}
      >
        <Heart size={20} color="#e77b7b" fill="#e77b7b" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.illustrationContainer}>
        <Heart size={80} color="#E0E0E0" />
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
      
      {/* Sticky colored strip */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Favorieten</Text>
      </View>

      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderSongItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7F5',
  },
  categoryHeader: {
    backgroundColor: '#f89c9c',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e77b7b',
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
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 64, // Ensures 44pt+ hit target
  },
  songMain: {
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
  songTitle: {
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});