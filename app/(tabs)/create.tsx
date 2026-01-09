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
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";

export default function CreateScreen() {
  const [prompt, setPrompt] = useState("");
  const { text, isGenerating, error, generate, clear } = useStoryGeneration();
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom as text streams in
  useEffect(() => {
    if (text) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [text]);

  const handleGenerate = () => {
    if (prompt.trim() && !isGenerating) {
      generate(prompt.trim());
    }
  };

  const handleClear = () => {
    setPrompt("");
    clear();
  };

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
          {(text || error) && (
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
        {text && (
          <ScrollView
            ref={scrollViewRef}
            style={styles.outputContainer}
            contentContainerStyle={styles.outputContent}
          >
            <ThemedText style={styles.storyText}>{text}</ThemedText>
            {isGenerating && (
              <View style={styles.cursorContainer}>
                <View style={styles.cursor} />
              </View>
            )}
          </ScrollView>
        )}
      </View>
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
  storyText: {
    color: "#ECEDEE",
    fontSize: 16,
    lineHeight: 26,
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
