import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { SupportedLanguage, LANGUAGE_CONFIG } from '@/types/settings';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onSelect: (language: SupportedLanguage) => void;
}

export function LanguageSelector({ selectedLanguage, onSelect }: LanguageSelectorProps) {
  const languages = Object.entries(LANGUAGE_CONFIG) as [
    SupportedLanguage,
    (typeof LANGUAGE_CONFIG)[SupportedLanguage]
  ][];

  return (
    <View style={styles.container}>
      {languages.map(([key, config]) => {
        const isSelected = selectedLanguage === key;
        return (
          <Pressable
            key={key}
            style={[styles.option, isSelected && styles.selected]}
            onPress={() => onSelect(key)}
          >
            <View style={styles.textContainer}>
              <ThemedText style={[styles.label, isSelected && styles.selectedText]}>
                {config.label}
              </ThemedText>
              <ThemedText style={[styles.native, isSelected && styles.selectedText]}>
                {config.nativeName}
              </ThemedText>
            </View>
            {isSelected && (
              <ThemedText style={styles.checkmark}>✓</ThemedText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: 'rgba(13, 115, 119, 0.15)',
    borderColor: '#0d7377',
  },
  textContainer: {
    gap: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  native: {
    fontSize: 14,
    opacity: 0.7,
  },
  selectedText: {
    color: '#0d7377',
  },
  checkmark: {
    fontSize: 18,
    color: '#0d7377',
    fontWeight: '700',
  },
});
