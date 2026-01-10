import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedText } from "@/components/themed-text";
import { useStories, Story } from "@/hooks/useStories";

export default function SavedReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStory, deleteStory } = useStories();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getStory(id).then((result) => {
        setStory(result ?? null);
        setLoading(false);
      });
    }
  }, [id, getStory]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Story",
      "Are you sure you want to delete this story? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (id) {
              await deleteStory(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Loading..." }} />
        <ActivityIndicator size="large" color="#0d7377" />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Not Found" }} />
        <ThemedText style={styles.errorText}>Story not found</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: story.title,
          headerStyle: { backgroundColor: "#151718" },
          headerTintColor: "#ECEDEE",
          headerRight: () => (
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <MaterialIcons name="delete" size={24} color="#ef4444" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.promptContainer}>
          <ThemedText style={styles.promptLabel}>Prompt</ThemedText>
          <ThemedText style={styles.promptText}>{story.prompt}</ThemedText>
        </View>
        <ThemedText style={styles.storyText}>{story.content}</ThemedText>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151718",
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#151718",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
  },
  promptContainer: {
    backgroundColor: "#1E2022",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  promptLabel: {
    color: "#9BA1A6",
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  promptText: {
    color: "#ECEDEE",
    fontSize: 14,
    fontStyle: "italic",
  },
  storyText: {
    color: "#ECEDEE",
    fontSize: 18,
    lineHeight: 28,
  },
  deleteButton: {
    padding: 8,
    marginRight: -8,
  },
});
