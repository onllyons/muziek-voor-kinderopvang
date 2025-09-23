import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { gqlFetch, edgesToArray } from "@/lib/gql";
import { MENU_TAGS } from "@/lib/queries-graphql";
import { SearchContext } from "./_layout";
import SearchResults from "@/components/SearchResults";

type MenuTag = {
  id: string | number;
  name: string;
  gradient_1: string | null;
  gradient_2: string | null;
  sort_order: number | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { results } = useContext(SearchContext);
  const logoSrc = require("../../assets/images/logo.png");
  const { width: imgW, height: imgH } = Image.resolveAssetSource(logoSrc);
  const aspect = imgW && imgH ? imgW / imgH : 1;
  const H_PADDING = 32;
  const logoWidth = Math.max(0, screenWidth - H_PADDING);
  const logoHeight = logoWidth / aspect;

  const [tags, setTags] = React.useState<MenuTag[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await gqlFetch<{ tagsCollection: any }>(MENU_TAGS);
      const nodes = edgesToArray<MenuTag>(data.tagsCollection);
      setTags(nodes ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Nu s-au putut încărca tag-urile din meniu");
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const renderHardcodedThemes = () => (
    <TouchableOpacity
      style={styles.buttonWrapper}
      activeOpacity={0.85}
      onPress={() => router.push("/themes")}
    >
      <View style={styles.shadowWrap}>
        <LinearGradient
          colors={["#87e9b4", "#6fd7a6"]}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.buttonText}>Thema's</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const renderMenuTag = (tag: MenuTag) => {
    const colors: [string, string] = [
      tag.gradient_1 ?? "#cccccc",
      tag.gradient_2 ?? "#aaaaaa",
    ];
    return (
      <TouchableOpacity
        key={String(tag.id)}
        style={styles.buttonWrapper}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/tag/[id]",
            params: {
              id: String(tag.id),
              name: tag.name,
              g1: tag.gradient_1 ?? "#86EABA",
              g2: tag.gradient_2 ?? "#4FBC80",
              origin: "home",
            },
          })
        }
      >
        <View style={styles.shadowWrap}>
          <LinearGradient
            colors={colors}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>{tag.name}</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {results.length > 0 ? (
        <SearchResults results={results} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: H_PADDING / 1 },
          ]}
        >
          <Image
            source={logoSrc}
            style={{
              width: logoWidth - 30,
              height: logoHeight,
              alignSelf: "center",
              marginTop: 18,
              marginBottom: 40,
            }}
            resizeMode="contain"
          />

          <View style={{ flex: 1 }}></View>

          <View style={styles.buttonsContainer}>
            {renderHardcodedThemes()}

            {loading ? (
              <View
                style={{ width: "100%", alignItems: "center", marginTop: 10 }}
              >
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>Loading...</Text>
              </View>
            ) : error ? (
              <Text
                style={{
                  color: "#B00020",
                  marginTop: 12,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {error}
              </Text>
            ) : (
              tags.map(renderMenuTag)
            )}
          </View>

          <View style={styles.buttonsContainer}>
            <SearchResults results={results} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const RADIUS = 22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF7F5",
    paddingHorizontal: 50,
  },
  content: { alignItems: "center", paddingVertical: 20 },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 22,
    marginBottom: 40,
  },
  buttonWrapper: {
    width: "48%",
  },
  shadowWrap: {
    borderRadius: RADIUS,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    ...Platform.select({ android: { elevation: 5 } }),
  },
  button: {
    borderRadius: RADIUS,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#534F50",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
