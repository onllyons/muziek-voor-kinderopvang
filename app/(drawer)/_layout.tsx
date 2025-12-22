import React, { useState, useEffect, createContext } from "react";
import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { View, TextInput, StyleSheet, Dimensions } from "react-native";
import { Search, CircleX } from "lucide-react-native";

import { gqlFetch, edgesToArray } from "@/lib/gql";
import { SEARCH_SONGS } from "@/lib/queries-graphql";

export const SearchContext = createContext<{results:any[], setResults:Function}>({
  results: [],
  setResults: () => {}
});

const BG = "#FEF7F5";
const HEADER_SEARCH_WIDTH = Dimensions.get("window").width - 80;

function HeaderSearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(value.trim());
    }, 500);
    return () => clearTimeout(delay);
  }, [value]);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <View style={[styles.searchWrap, { width: HEADER_SEARCH_WIDTH }]}>
      <TextInput
        placeholder="Zoek muziek"
        placeholderTextColor="#9AA0A6"
        style={styles.searchInput}
        value={value}
        onChangeText={setValue}
      />

      {value.length > 0 ? (
        <CircleX
          size={20}
          color="#505050"
          style={styles.searchIcon}
          onPress={handleClear}
        />
      ) : (
        <Search size={20} color="#505050" style={styles.searchIcon} />
      )}
    </View>
  );
}

export default function Layout() {
  const [results, setResults] = useState<any[]>([]);



const handleSearch = async (q: string) => {
  if (!q) {
    console.log("⚠️ Empty query, clearing results");
    return setResults([]);
  }

  console.log("📡 Sending search:", q);

  try {
    const data = await gqlFetch<{ songsCollection: any }>(SEARCH_SONGS, {
      q: `%${q}%`, // 🔑 pentru ilike
    });

    const items = edgesToArray<{
      id: string;
      title: string;
      lyrics?: string;
      optimized_file?: string | null;
      cover_file?: string | null;
    }>(data.songsCollection);

    console.log("📊 Results found:", items.length);
    setResults(items);
  } catch (e) {
    console.error("❌ Search error:", e);
    setResults([]);
  }
};

  return (
    <SearchContext.Provider value={{results, setResults}}>
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
          headerTitle: () => <HeaderSearchBar onSearch={handleSearch} />,
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


        <Drawer.Screen name="index" />
        <Drawer.Screen
          name="feedback"
          options={{
            drawerLabel: "Feedback",
            headerTitle: "Feedback",
          }}
        />
        <Drawer.Screen name="themes" options={{ drawerItemStyle: { display: "none" } }} />
        <Drawer.Screen name="white-noise" options={{ drawerItemStyle: { display: "none" } }} />
        <Drawer.Screen name="muziek" options={{ drawerItemStyle: { display: "none" } }} />
        <Drawer.Screen name="category-list" options={{ drawerItemStyle: { display: "none" } }} />
        <Drawer.Screen name="tag/[id]" options={{ drawerItemStyle: { display: "none" } }} />
      </Drawer>
    </SearchContext.Provider>
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
