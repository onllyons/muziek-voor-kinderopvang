import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function BackHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Ga terug"
      >
        <ChevronLeft size={24} color="#333" />
        <Text style={styles.backText}>Terug</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 25,
    backgroundColor: '#FEF7F5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
});