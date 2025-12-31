import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SynchronizedReader } from '@/components/reader';
import type { ReadingData } from '@/components/reader';

// Static imports for readings
// Add new readings here as they are generated
const READINGS: Record<string, { data: ReadingData; audio: number }> = {
  'jack-and-beanstalk': {
    data: require('@/assets/readings/jack-and-beanstalk.json'),
    audio: require('@/assets/readings/jack-and-beanstalk.mp3'),
  },
  'tigershark': {
    data: require('@/assets/readings/tigershark.json'),
    audio: require('@/assets/readings/tigershark.mp3'),
  },
};

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const reading = id ? READINGS[id] : null;

  if (!reading) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.errorText}>Reading not found: {id}</Text>
        <Text style={styles.errorHint}>
          Available readings: {Object.keys(READINGS).join(', ')}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: reading.data.title,
          headerStyle: { backgroundColor: '#151718' },
          headerTintColor: '#ECEDEE',
        }}
      />
      <SynchronizedReader
        readingData={reading.data}
        audioSource={reading.audio}
      />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#151718',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ECEDEE',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: '#9BA1A6',
    textAlign: 'center',
  },
});
