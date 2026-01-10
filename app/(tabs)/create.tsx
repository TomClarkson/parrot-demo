import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useBilingualStoryGeneration } from "@/hooks/useBilingualStoryGeneration";
import { useStories } from "@/hooks/useStories";
import { useSettings } from "@/hooks/useSettings";
import { useWordLookup } from "@/hooks/useWordLookup";
import { BilingualStoryView } from "@/components/bilingual/BilingualStoryView";
import { WordInfoModal } from "@/components/bilingual/WordInfoModal";
import { LANGUAGE_CONFIG } from "@/types/settings";

export default function CreateScreen() {
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { settings } = useSettings();
  const { content, rawText, isGenerating, error, generate, clear } =
    useBilingualStoryGeneration(settings.targetLanguage);
  const { saveStory } = useStories();
  const { wordInfo, isLoading: isWordLoading, error: wordError, lookup, clear: clearWord } =
    useWordLookup(settings.targetLanguage);

  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const languageLabel = LANGUAGE_CONFIG[settings.targetLanguage].label;

  // Auto-scroll to bottom as text streams in
  useEffect(() => {
    if (rawText || content) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [rawText, content]);

  const handleGenerate = () => {
    if (prompt.trim() && !isGenerating) {
      generate(prompt.trim());
    }
  };

  const handleSave = async () => {
    if (!content || isSaving) return;

    setIsSaving(true);
    try {
      // Convert bilingual content to a readable format for storage
      const storyText = content.paragraphs
        .map((p) =>
          p.sentences.map((s) => `${s.english}\n${s.translation}`).join("\n\n")
        )
        .join("\n\n");

      const story = await saveStory(prompt, storyText, content.title);
      Alert.alert("Story Saved!", `"${story.title}" has been saved.`, [
        { text: "View Library", onPress: () => router.push("/(tabs)") },
        { text: "Create Another", onPress: handleClear },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to save story. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    clear();
  };

  const handleWordTap = (word: string, sentenceContext: string) => {
    setModalVisible(true);
    lookup(word, sentenceContext);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    clearWord();
  };

  const showSaveButton = content && !isGenerating && !error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">Create Story</ThemedText>
        <ThemedText style={styles.subtitle}>
          Describe your story idea and watch it come to life
        </ThemedText>
        <View style={styles.languageBadge}>
          <Text style={styles.languageBadgeText}>
            Learning: {languageLabel}
          </Text>
        </View>
      </ThemedView>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="A brave knight who befriends a dragon..."
            placeholderTextColor="#666"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={3}
            editable={!isGenerating}
          />
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              styles.generateButton,
              (isGenerating || !prompt.trim()) && styles.buttonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.buttonText}>Generate Story</ThemedText>
            )}
          </Pressable>

          {showSaveButton && (
            <Pressable
              style={[
                styles.button,
                styles.saveButton,
                isSaving && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Save</ThemedText>
              )}
            </Pressable>
          )}

          {(content || rawText || error) && (
            <Pressable
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
            >
              <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
            </Pressable>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {(rawText || content) && (
          <ScrollView
            ref={scrollViewRef}
            style={styles.outputContainer}
            contentContainerStyle={styles.outputContent}
          >
            {content ? (
              <BilingualStoryView
                content={content}
                language={settings.targetLanguage}
                onWordTap={handleWordTap}
              />
            ) : (
              <>
                <ThemedText style={styles.streamingText}>{rawText}</ThemedText>
                {isGenerating && (
                  <View style={styles.cursorContainer}>
                    <View style={styles.cursor} />
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}
      </View>

      <WordInfoModal
        visible={modalVisible}
        wordInfo={wordInfo}
        isLoading={isWordLoading}
        error={wordError}
        onClose={handleCloseModal}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151718",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#151718",
  },
  subtitle: {
    color: "#9BA1A6",
    marginTop: 4,
  },
  languageBadge: {
    marginTop: 12,
    backgroundColor: "rgba(13, 115, 119, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  languageBadgeText: {
    color: "#0d7377",
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    backgroundColor: "#1E2022",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  input: {
    color: "#ECEDEE",
    fontSize: 16,
    padding: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButton: {
    flex: 1,
    backgroundColor: "#0d7377",
  },
  saveButton: {
    backgroundColor: "#10b981",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  clearButtonText: {
    color: "#9BA1A6",
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
  },
  outputContainer: {
    flex: 1,
    backgroundColor: "#1E2022",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  outputContent: {
    padding: 16,
  },
  streamingText: {
    color: "#9BA1A6",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  cursorContainer: {
    flexDirection: "row",
    marginTop: 2,
  },
  cursor: {
    width: 8,
    height: 20,
    backgroundColor: "#0d7377",
    opacity: 0.8,
  },
});
