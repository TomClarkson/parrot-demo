import { StyleSheet, View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const STORIES = [
  {
    id: 'jack-and-beanstalk',
    title: 'Jack and the Beanstalk',
    description: 'A classic tale of magic beans and a giant in the sky',
    duration: '0:23',
  },
  {
    id: 'tigershark',
    title: 'Tigershark and the Ink Cloud Caper',
    description: 'An underwater adventure in Splash Bay',
    duration: '2:00',
  },
  {
    id: 'sleepy-bunny',
    title: 'The Sleepy Bunny',
    description: 'A cozy bedtime story about a little bunny named Pip',
    duration: '1:16',
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Stories</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tap a story to listen with word highlighting
        </ThemedText>
      </ThemedView>

      <View style={styles.storiesContainer}>
        {STORIES.map((story) => (
          <Link key={story.id} href={`/reader/${story.id}`} asChild>
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
                <ThemedText style={styles.duration}>{story.duration}</ThemedText>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#151718',
  },
  subtitle: {
    color: '#9BA1A6',
    marginTop: 4,
  },
  storiesContainer: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  storyCard: {
    backgroundColor: '#1E2022',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    color: '#ECEDEE',
    marginBottom: 4,
  },
  storyDescription: {
    color: '#9BA1A6',
    fontSize: 14,
  },
  storyMeta: {
    marginLeft: 12,
  },
  duration: {
    color: '#0d7377',
    fontSize: 14,
    fontWeight: '600',
  },
});
