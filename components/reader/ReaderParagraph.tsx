import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ReaderSentence } from './ReaderSentence';
import type { Paragraph, CurrentPosition } from './types';

interface ReaderParagraphProps {
  paragraph: Paragraph;
  paragraphIndex: number;
  currentPosition: CurrentPosition | null;
}

export function ReaderParagraph({
  paragraph,
  paragraphIndex,
  currentPosition,
}: ReaderParagraphProps) {
  const isCurrentParagraph = currentPosition?.paragraphIndex === paragraphIndex;

  return (
    <View style={styles.paragraphContainer}>
      {paragraph.sentences.map((sentence, sentenceIdx) => {
        const isCurrentSentence =
          isCurrentParagraph && currentPosition?.sentenceIndex === sentenceIdx;
        const currentWordIndex = isCurrentSentence
          ? currentPosition?.wordIndex ?? null
          : null;

        return (
          <ReaderSentence
            key={sentenceIdx}
            sentence={sentence}
            isCurrentSentence={isCurrentSentence}
            currentWordIndex={currentWordIndex}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  paragraphContainer: {
    marginBottom: 20,
  },
});
