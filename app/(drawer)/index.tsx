import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  useWindowDimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const logoSrc = require("../../assets/images/logo.png");
  const { width: imgW, height: imgH } = Image.resolveAssetSource(logoSrc);
  const aspect = imgW && imgH ? imgW / imgH : 1;
  const H_PADDING = 32;
  const logoWidth = Math.max(0, screenWidth - H_PADDING);
  const logoHeight = logoWidth / aspect;

  const buttons = [
    { id: 1, title: "Overgang", colors: ["#ffe36e", "#ffcd6e"] },
    { id: 2, title: "Thema's", colors: ["#87e9b4", "#6fd7a6"] },
    { id: 3, title: "Witte Ruis", colors: ["#e4dcfd", "#d2c4fa"] },
    { id: 4, title: "Favorieten", colors: ["#f89c9c", "#e77b7b"] },
  ];

  const handleButtonPress = (id: number) => {
    if (id === 1) router.push("/(drawer)/category-list");
    else if (id === 2) router.push("/(drawer)/themes");
    else if (id === 3) router.push("/(drawer)/white-noise");
    else if (id === 4) router.push("/(drawer)/favorieten");
  };

  return (
    <SafeAreaView style={styles.container}>
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

        <View style={styles.buttonsContainer}>
          {buttons.map((btn) => (
            <TouchableOpacity
              key={btn.id}
              style={styles.buttonWrapper}
              onPress={() => handleButtonPress(btn.id)}
              activeOpacity={0.85}
            >
              <View style={styles.shadowWrap}>
                <LinearGradient
                  colors={btn.colors}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>{btn.title}</Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    ...Platform.select({
      android: {
        elevation: 5,
      },
    }),
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
