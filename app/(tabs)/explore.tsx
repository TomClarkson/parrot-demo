import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { Platform, StyleSheet, View, Pressable, Alert } from "react-native";

import { Collapsible } from "@/components/ui/collapsible";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useStories } from "@/hooks/useStories";
import { useSettings } from "@/hooks/useSettings";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { LANGUAGE_CONFIG } from "@/types/settings";

export default function SettingsScreen() {
  const { stories, resetDatabase } = useStories();
  const { settings, setTargetLanguage } = useSettings();

  const handleResetDatabase = () => {
    const storyCount = stories.length;
    Alert.alert(
      "Reset Database",
      storyCount > 0
        ? `This will delete all ${storyCount} saved ${storyCount === 1 ? "story" : "stories"}. This cannot be undone.`
        : "The database is already empty.",
      storyCount > 0
        ? [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete All",
              style: "destructive",
              onPress: async () => {
                await resetDatabase();
                Alert.alert("Done", "All stories have been deleted.");
              },
            },
          ]
        : [{ text: "OK" }]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Settings
        </ThemedText>
      </ThemedView>

      <Collapsible title="Language Settings" initiallyOpen>
        <ThemedView style={styles.languageSection}>
          <ThemedText style={styles.languageDescription}>
            Select the language you're studying. Stories will be generated with
            translations in this language.
          </ThemedText>
          <ThemedText style={styles.currentLanguage}>
            Currently learning:{" "}
            <ThemedText type="defaultSemiBold">
              {LANGUAGE_CONFIG[settings.targetLanguage].label}
            </ThemedText>
          </ThemedText>
          <LanguageSelector
            selectedLanguage={settings.targetLanguage}
            onSelect={setTargetLanguage}
          />
        </ThemedView>
      </Collapsible>

      <Collapsible title="Data Management">
        <ThemedView style={styles.dataSection}>
          <ThemedText style={styles.dataInfo}>
            You have {stories.length} saved{" "}
            {stories.length === 1 ? "story" : "stories"}.
          </ThemedText>
          <Pressable
            style={styles.resetButton}
            onPress={handleResetDatabase}
          >
            <ThemedText style={styles.resetButtonText}>
              Reset Database
            </ThemedText>
          </Pressable>
        </ThemedView>
      </Collapsible>

      <Collapsible title="App Version">
        <ThemedView style={styles.versionContainer}>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Version: </ThemedText>
            {Constants.expoConfig?.version ?? "N/A"}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Platform: </ThemedText>
            {Platform.OS} ({Platform.Version})
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Update ID: </ThemedText>
            {Updates.updateId ?? "Development"}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Channel: </ThemedText>
            {Updates.channel ?? "N/A"}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Runtime Version: </ThemedText>
            {Updates.runtimeVersion ?? "N/A"}
          </ThemedText>
        </ThemedView>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  languageSection: {
    gap: 12,
  },
  languageDescription: {
    color: "#9BA1A6",
    lineHeight: 20,
  },
  currentLanguage: {
    marginBottom: 4,
  },
  versionContainer: {
    gap: 4,
  },
  dataSection: {
    gap: 12,
  },
  dataInfo: {
    color: "#9BA1A6",
  },
  resetButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
