import { Pressable, StyleSheet, Text } from 'react-native';

interface TappableWordProps {
  word: string;
  isTranslation: boolean;
  onTap: (word: string) => void;
}

export function TappableWord({ word, isTranslation, onTap }: TappableWordProps) {
  // Only allow tapping on translation words (not English)
  if (!isTranslation) {
    return <Text style={styles.word}>{word} </Text>;
  }

  return (
    <Pressable
      onPress={() => onTap(word)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Text style={[styles.word, styles.translationWord]}>{word} </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  word: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  translationWord: {
    color: '#0d7377',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  pressed: {
    opacity: 0.6,
  },
});
