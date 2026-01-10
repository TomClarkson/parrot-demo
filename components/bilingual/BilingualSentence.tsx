import { View, Text, StyleSheet } from 'react-native';
import { TappableWord } from './TappableWord';
import { BilingualSentence as BilingualSentenceType } from '@/types/bilingual';
import { SupportedLanguage } from '@/types/settings';

interface BilingualSentenceProps {
  sentence: BilingualSentenceType;
  language: SupportedLanguage;
  onWordTap: (word: string, sentenceContext: string) => void;
}

export function BilingualSentence({
  sentence,
  language,
  onWordTap,
}: BilingualSentenceProps) {
  // For Chinese, split into individual characters
  // For other languages, split on spaces
  const isChinese = language === 'chinese';
  const translationUnits = isChinese
    ? sentence.translation.split('').filter((char) => char.trim())
    : sentence.translation.split(/\s+/);

  return (
    <View style={styles.container}>
      <Text style={styles.englishText}>{sentence.english}</Text>
      <View style={styles.translationRow}>
        {translationUnits.map((unit, idx) => (
          <TappableWord
            key={`${idx}-${unit}`}
            word={unit}
            isTranslation={true}
            onTap={(word) => onWordTap(word, sentence.translation)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  englishText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
    marginBottom: 4,
  },
  translationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
