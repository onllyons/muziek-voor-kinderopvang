import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BackHeader from '@/components/BackHeader';
import { usePlayer } from '@/contexts/PlayerContext';

const THEMES = [
  'Vrolijk',
  'Herfst', 
  'Sinterklaas',
  'Dieren',
  'Rustig',
  'Eten'
];

export default function ThemesScreen() {
  const { setFilter, currentFilter } = usePlayer();

  const handleThemePress = (theme: string) => {
    console.log('Theme pressed:', theme);
    // Set filter in player context
    setFilter(theme);
  };

  const renderThemeItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.pillWrapper}
      onPress={() => handleThemePress(item)}
    >
      <LinearGradient
        colors={['#a8e6cf', '#88d8a3']}
        style={styles.pill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.pillText}>{item}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />
      
      {/* Sticky colored strip */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Thema's</Text>
      </View>

      <FlatList
        data={THEMES}
        renderItem={renderThemeItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
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
    backgroundColor: '#87e9b4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#6fd7a6',
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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pillWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  pill: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#534F50',
    textAlign: 'center',
  },
});