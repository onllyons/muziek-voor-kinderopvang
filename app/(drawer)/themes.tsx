import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BackHeader from '@/components/BackHeader';
import { usePlayer } from '@/contexts/PlayerContext';

type ThemeKey =
  | 'Vrolijk'
  | 'Herfst'
  | 'Sinterklaas'
  | 'Dieren'
  | 'Rustig'
  | 'Eten';

const THEMES: ThemeKey[] = [
  'Vrolijk',
  'Herfst',
  'Sinterklaas',
  'Dieren',
  'Rustig',
  'Eten',
];

const THEME_GRADIENTS: Record<ThemeKey, [string, string]> = {
  Vrolijk: ['#FFA6F0', '#D45DFF'],
  Herfst: ['#EAC286', '#BC8B4F'],
  Sinterklaas: ['#FF8F8F', '#FF5050'],
  Dieren: ['#F5F8B0', '#EEDE67'],
  Rustig: ['#A6D3FF', '#795EFF'],
  Eten: ['#9CFFEF', '#4F9DBC'],

};

export default function ThemesScreen() {
  const { setFilter } = usePlayer();

  const handleThemePress = (theme: ThemeKey) => {
    setFilter(theme);
  };

  const renderThemeItem = ({ item }: { item: ThemeKey }) => {
    const colors = THEME_GRADIENTS[item];

    return (
      <TouchableOpacity
        style={styles.pillWrapper}
        onPress={() => handleThemePress(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Alege tema ${item}`}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0.1 }}
          end={{ x: 1, y: 0.9 }}
          style={styles.pill}
        >
          <Text style={styles.pillText}>{item}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />

      <View style={styles.categoryHeader}>
        <LinearGradient
          colors={['#86EABA', '#4FBC80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryTitle}>Overgang</Text>
        </LinearGradient>
      </View>

      <FlatList
        style={{ marginTop: 30 }}
        data={THEMES}
        renderItem={renderThemeItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const PILL_HEIGHT = 60;
const PILL_RADIUS = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7F5',
  },

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
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
    marginTop: 18,
  },
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
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    ...Platform.select({ android: { elevation: 8 } }),
  },
  pillText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#534F50',
  },
});
