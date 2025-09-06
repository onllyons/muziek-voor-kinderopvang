import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const buttons = [
    { id: 1, title: 'Overgang', colors: ['#ffe36e', '#ffcd6e'] },
    { id: 2, title: "Thema's", colors: ['#87e9b4', '#6fd7a6'] },
    { id: 3, title: 'Witte Ruis', colors: ['#e4dcfd', '#d2c4fa'] },
    { id: 4, title: 'Favorieten', colors: ['#f89c9c', '#e77b7b'] },
  ];

  const handleButtonPress = (buttonId: number, title: string) => {
    if (buttonId === 1) { // Overgang button
      router.push('/(drawer)/category-list');
    } else if (buttonId === 2) { // Thema's button
      router.push('/(drawer)/themes');
    } else if (buttonId === 3) { // Witte Ruis button
      router.push('/(drawer)/white-noise');
    } else if (buttonId === 4) { // Favorieten button
      router.push('/(drawer)/favorieten');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Muziek voor Kinderopvang</Text>

        <View style={styles.buttonsContainer}>
          {buttons.map((btn) => (
            <TouchableOpacity 
              key={btn.id} 
              style={styles.buttonWrapper}
              onPress={() => handleButtonPress(btn.id, btn.title)}
            >
              <LinearGradient
                colors={btn.colors}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7F5',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  buttonWrapper: {
    width: '45%',
    minWidth: 130,
  },
  button: {
    flex: 1,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderRadius: 16,
    paddingVertical: 25,
  },
  buttonText: {
    color: '#534F50',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});