import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'parrot-stories';

export interface Story {
  id: string;
  title: string;
  prompt: string;
  content: string;
  createdAt: Date;
}

// Generate UUID for story IDs
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Extract title from story content (first line or first sentence)
function extractTitle(content: string): string {
  const firstLine = content.split('\n')[0].trim();
  // Remove markdown headers if present
  const cleanTitle = firstLine.replace(/^#+\s*/, '');
  // Limit length
  if (cleanTitle.length > 60) {
    return cleanTitle.substring(0, 57) + '...';
  }
  return cleanTitle || 'Untitled Story';
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Load stories from AsyncStorage on mount
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Convert date strings back to Date objects
        const storiesWithDates = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
        }));
        setStories(storiesWithDates);
      }
    } catch (err) {
      setError(err as Error);
    }
  };

  const persistStories = async (newStories: Story[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStories));
      setStories(newStories);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const saveStory = useCallback(
    async (prompt: string, content: string, customTitle?: string): Promise<Story> => {
      const newStory: Story = {
        id: generateId(),
        title: customTitle || extractTitle(content),
        prompt,
        content,
        createdAt: new Date(),
      };

      const newStories = [newStory, ...stories];
      await persistStories(newStories);
      return newStory;
    },
    [stories]
  );

  const deleteStory = useCallback(
    async (id: string): Promise<void> => {
      const newStories = stories.filter((s) => s.id !== id);
      await persistStories(newStories);
    },
    [stories]
  );

  const getStory = useCallback(
    async (id: string): Promise<Story | undefined> => {
      return stories.find((s) => s.id === id);
    },
    [stories]
  );

  const resetDatabase = useCallback(async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setStories([]);
  }, []);

  return {
    stories,
    error,
    saveStory,
    deleteStory,
    getStory,
    resetDatabase,
  };
}
