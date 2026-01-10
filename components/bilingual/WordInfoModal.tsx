import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { WordInfo } from '@/types/bilingual';

interface WordInfoModalProps {
  visible: boolean;
  wordInfo: WordInfo | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export function WordInfoModal({
  visible,
  wordInfo,
  isLoading,
  error,
  onClose,
}: WordInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#0d7377" size="large" />
              <Text style={styles.loadingText}>Looking up word...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {wordInfo && !isLoading && (
            <View style={styles.content}>
              <Text style={styles.word}>{wordInfo.word}</Text>

              {wordInfo.pronunciation && (
                <Text style={styles.pronunciation}>{wordInfo.pronunciation}</Text>
              )}

              <View style={styles.divider} />

              <Text style={styles.translation}>{wordInfo.translation}</Text>

              {wordInfo.partOfSpeech && (
                <View style={styles.posContainer}>
                  <Text style={styles.posLabel}>Part of speech:</Text>
                  <Text style={styles.posValue}>{wordInfo.partOfSpeech}</Text>
                </View>
              )}
            </View>
          )}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 200,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#9BA1A6',
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  word: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0d7377',
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 16,
    color: '#9BA1A6',
    fontStyle: 'italic',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  translation: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  posContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  posLabel: {
    fontSize: 14,
    color: '#9BA1A6',
  },
  posValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
