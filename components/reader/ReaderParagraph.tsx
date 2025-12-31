import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { ReaderSentence } from './ReaderSentence';
import type { Paragraph, CurrentPosition } from './types';

interface ReaderParagraphProps {
  paragraph: Paragraph;
  paragraphIndex: number;
  currentPosition: CurrentPosition | null;
  onSentenceLayout?: (paragraphIndex: number, sentenceIndex: number, y: number) => void;
}

export function ReaderParagraph({
  paragraph,
  paragraphIndex,
  currentPosition,
  onSentenceLayout,
}: ReaderParagraphProps) {
  const isCurrentParagraph = currentPosition?.paragraphIndex === paragraphIndex;
  const paragraphY = useRef<number>(0);

  const handleParagraphLayout = useCallback((event: LayoutChangeEvent) => {
    paragraphY.current = event.nativeEvent.layout.y;
  }, []);

  const handleSentenceLayout = useCallback((sentenceIndex: number, event: LayoutChangeEvent) => {
    if (onSentenceLayout) {
      // Calculate absolute Y position (paragraph Y + sentence Y within paragraph)
      const absoluteY = paragraphY.current + event.nativeEvent.layout.y;
      onSentenceLayout(paragraphIndex, sentenceIndex, absoluteY);
    }
  }, [paragraphIndex, onSentenceLayout]);

  return (
    <View style={styles.paragraphContainer} onLayout={handleParagraphLayout}>
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
            sentenceIndex={sentenceIdx}
            isCurrentSentence={isCurrentSentence}
            currentWordIndex={currentWordIndex}
            onLayout={handleSentenceLayout}
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
