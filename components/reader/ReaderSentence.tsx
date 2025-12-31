import React, { useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { ReaderWord } from './ReaderWord';
import type { Sentence } from './types';

interface ReaderSentenceProps {
  sentence: Sentence;
  sentenceIndex: number;
  isCurrentSentence: boolean;
  currentWordIndex: number | null;
  onLayout?: (sentenceIndex: number, event: LayoutChangeEvent) => void;
}

const SENTENCE_HIGHLIGHT_BG = 'rgba(13, 115, 119, 0.15)';
const SENTENCE_BORDER_COLOR = 'rgba(13, 115, 119, 0.4)';

export function ReaderSentence({
  sentence,
  sentenceIndex,
  isCurrentSentence,
  currentWordIndex,
  onLayout,
}: ReaderSentenceProps) {
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    if (onLayout) {
      onLayout(sentenceIndex, event);
    }
  }, [sentenceIndex, onLayout]);

  return (
    <View
      style={[
        styles.sentenceContainer,
        isCurrentSentence && styles.highlightedSentence
      ]}
      onLayout={handleLayout}
    >
      <View style={styles.wordsContainer}>
        {sentence.words.map((word, idx) => (
          <ReaderWord
            key={idx}
            word={word}
            isCurrentWord={isCurrentSentence && currentWordIndex === idx}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sentenceContainer: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginVertical: 2,
  },
  highlightedSentence: {
    backgroundColor: SENTENCE_HIGHLIGHT_BG,
    borderColor: SENTENCE_BORDER_COLOR,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});
