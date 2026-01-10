import { StyleSheet, View, Pressable, SectionList } from "react-native";
import { Link, Href } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useStories } from "@/hooks/useStories";

const FEATURED_STORIES = [
  {
    id: "jack-and-beanstalk",
    title: "Jack and the Beanstalk",
    description: "A classic tale of magic beans and a giant in the sky",
    duration: "0:23",
    hasAudio: true,
  },
  {
    id: "tigershark",
    title: "Tigershark and the Ink Cloud Caper",
    description: "An underwater adventure in Splash Bay",
    duration: "2:00",
    hasAudio: true,
  },
];

interface StoryItem {
  id: string;
  title: string;
  description: string;
  duration?: string;
  hasAudio: boolean;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StoryCard({
  story,
  isSaved,
}: {
  story: StoryItem;
  isSaved: boolean;
}) {
  const href = (isSaved ? `/saved-reader/${story.id}` : `/reader/${story.id}`) as Href;

  return (
    <Link href={href} asChild>
      <Pressable style={styles.storyCard}>
        <View style={styles.storyContent}>
          <ThemedText type="subtitle" style={styles.storyTitle}>
            {story.title}
          </ThemedText>
          <ThemedText style={styles.storyDescription}>
            {story.description}
          </ThemedText>
        </View>
        <View style={styles.storyMeta}>
          {story.hasAudio ? (
            <ThemedText style={styles.duration}>{story.duration}</ThemedText>
          ) : (
            <ThemedText style={styles.textOnly}>Text</ThemedText>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const { stories: savedStories } = useStories();

  // Transform saved stories to StoryItem format
  const savedStoryItems: StoryItem[] = savedStories.map((story) => ({
    id: story.id,
    title: story.title,
    description:
      story.prompt.length > 60
        ? story.prompt.substring(0, 57) + "..."
        : story.prompt,
    duration: formatDate(story.createdAt),
    hasAudio: false,
  }));

  const sections = [
    ...(savedStoryItems.length > 0
      ? [{ title: "My Stories", data: savedStoryItems, isSaved: true }]
      : []),
    { title: "Featured Stories", data: FEATURED_STORIES, isSaved: false },
  ];

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Stories</ThemedText>
        <ThemedText style={styles.subtitle}>Tap a story to read</ThemedText>
      </ThemedView>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, section }) => (
          <StoryCard story={item} isSaved={section.isSaved} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <ThemedText style={styles.sectionHeader}>{title}</ThemedText>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </View>
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9BA1A6",
    marginTop: 8,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  storyCard: {
    backgroundColor: "#1E2022",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    color: "#ECEDEE",
    marginBottom: 4,
  },
  storyDescription: {
    color: "#9BA1A6",
    fontSize: 14,
  },
  storyMeta: {
    marginLeft: 12,
  },
  duration: {
    color: "#0d7377",
    fontSize: 14,
    fontWeight: "600",
  },
  textOnly: {
    color: "#9BA1A6",
    fontSize: 12,
    fontStyle: "italic",
  },
});
