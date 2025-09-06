// app/(drawer)/_layout.tsx
import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { View, TextInput, StyleSheet, Dimensions, Platform } from 'react-native';
import { Search } from 'lucide-react-native';

const BG = '#FEF7F5';
const HEADER_SEARCH_WIDTH = Dimensions.get('window').width - 80;

function HeaderSearchBar() {
  return (
    <View style={[styles.searchWrap, { width: HEADER_SEARCH_WIDTH }]}>
      <TextInput
        placeholder="Zoek muziek"
        placeholderTextColor="#9AA0A6"
        style={styles.searchInput}
        returnKeyType="search"
      />
      <Search size={20} color="#505050" style={styles.searchIcon} />
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { 
          backgroundColor: BG,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#333',
        headerTitleAlign: 'left',
        headerLeft: () => <DrawerToggleButton tintColor="#333" />,
        headerTitle: () => <HeaderSearchBar />,
        drawerStyle: { 
          backgroundColor: BG,
          borderRightWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        drawerActiveTintColor: '#2196F3',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen name="index" options={{ drawerLabel: 'Home' }} />
      <Drawer.Screen name="muziek" options={{ drawerLabel: 'Muziek' }} />
      <Drawer.Screen name="test" options={{ drawerLabel: 'Test' }} />
      <Drawer.Screen name="category-list" options={{ drawerLabel: 'Category List' }} />
      <Drawer.Screen name="themes" options={{ drawerLabel: 'Themes' }} />
      <Drawer.Screen name="white-noise" options={{ drawerLabel: 'White Noise' }} />
      <Drawer.Screen name="favorieten" options={{ drawerLabel: 'Favorieten' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
});
