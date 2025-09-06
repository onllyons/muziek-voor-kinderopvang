import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import BackHeader from '@/components/BackHeader';

export default function TestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <BackHeader />
      <View style={styles.content}>
        <Text style={styles.text}>Test Page</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});