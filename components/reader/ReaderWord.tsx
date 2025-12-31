import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Word } from './types';

interface ReaderWordProps {
  word: Word;
  isCurrentWord: boolean;
}

const HIGHLIGHT_COLOR = '#0d7377';

export function ReaderWord({
  word,
  isCurrentWord,
}: ReaderWordProps) {
  // Use regular styles instead of Reanimated for web compatibility
  return (
    <View style={[
      styles.wordContainer,
      isCurrentWord && styles.highlightedContainer
    ]}>
      <Text style={[
        styles.word,
        isCurrentWord && styles.highlightedText
      ]}>
        {word.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wordContainer: {
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
    marginRight: 6,
  },
  highlightedContainer: {
    backgroundColor: HIGHLIGHT_COLOR,
  },
  word: {
    fontSize: 20,
    lineHeight: 32,
    color: '#ECEDEE',
  },
  highlightedText: {
    color: '#FFFFFF',
  },
});
