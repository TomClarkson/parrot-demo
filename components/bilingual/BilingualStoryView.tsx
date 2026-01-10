import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BilingualSentence } from './BilingualSentence';
import { BilingualContent } from '@/types/bilingual';
import { SupportedLanguage } from '@/types/settings';

interface BilingualStoryViewProps {
  content: BilingualContent;
  language: SupportedLanguage;
  onWordTap: (word: string, sentenceContext: string) => void;
}

export function BilingualStoryView({
  content,
  language,
  onWordTap,
}: BilingualStoryViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.titleTranslation}>{content.titleTranslation}</Text>
      </View>

      {content.paragraphs.map((paragraph, pIdx) => (
        <View key={pIdx} style={styles.paragraph}>
          {paragraph.sentences.map((sentence, sIdx) => (
            <BilingualSentence
              key={`${pIdx}-${sIdx}`}
              sentence={sentence}
              language={language}
              onWordTap={onWordTap}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  titleTranslation: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d7377',
  },
  paragraph: {
    marginBottom: 20,
  },
});
