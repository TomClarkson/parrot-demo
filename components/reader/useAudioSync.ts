import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import type { ReadingData, CurrentPosition, WordTimelineEntry } from './types';

interface UseAudioSyncResult {
  isPlaying: boolean;
  isLoaded: boolean;
  currentTimeMs: number;
  duration: number;
  currentPosition: CurrentPosition | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (timeMs: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
}

export function useAudioSync(
  readingData: ReadingData,
  audioSource: number | { uri: string }
): UseAudioSyncResult {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  // Use totalDuration from readingData as fallback for web (expo-av doesn't always provide it)
  const [duration, setDuration] = useState(readingData.totalDuration);
  const [currentPosition, setCurrentPosition] = useState<CurrentPosition | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wordTimeline = useMemo(() => readingData.wordTimeline, [readingData]);

  // Binary search to find current position based on time
  const findCurrentPosition = useCallback(
    (timeMs: number): CurrentPosition | null => {
      if (wordTimeline.length === 0) return null;

      let left = 0;
      let right = wordTimeline.length - 1;
      let result: WordTimelineEntry | null = null;

      // Binary search for the word that contains this time
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const entry = wordTimeline[mid];

        if (timeMs >= entry.startTime && timeMs <= entry.endTime) {
          result = entry;
          break;
        } else if (timeMs < entry.startTime) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }

      // If no exact match, find the closest word
      if (!result) {
        for (let i = 0; i < wordTimeline.length; i++) {
          const entry = wordTimeline[i];
          if (timeMs >= entry.startTime && timeMs <= entry.endTime) {
            result = entry;
            break;
          }
          // If we're between words, use the previous word
          if (entry.startTime > timeMs) {
            result = i > 0 ? wordTimeline[i - 1] : wordTimeline[0];
            break;
          }
          result = entry;
        }
      }

      if (!result) return null;

      return {
        paragraphIndex: result.paragraphIndex,
        sentenceIndex: result.sentenceIndex,
        wordIndex: result.wordIndex,
      };
    },
    [wordTimeline]
  );

  // Update position and find current word
  const updatePosition = useCallback(
    (timeMs: number) => {
      setCurrentTimeMs(timeMs);
      const position = findCurrentPosition(timeMs);
      setCurrentPosition(position);
    },
    [findCurrentPosition]
  );

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        setIsLoaded(false);
        return;
      }

      setIsLoaded(true);
      // Only update duration if we get a valid value from expo-av
      if (status.durationMillis && !isNaN(status.durationMillis)) {
        setDuration(status.durationMillis);
      }
      setIsPlaying(status.isPlaying);

      // On native platforms, use the position from status updates
      if (Platform.OS !== 'web' && status.positionMillis !== undefined) {
        updatePosition(status.positionMillis);
      }

      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentTimeMs(0);
        setCurrentPosition(null);
      }
    },
    [updatePosition]
  );

  // Load audio on mount
  useEffect(() => {
    let isMounted = true;

    async function loadAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          audioSource,
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );

        if (!isMounted) {
          await newSound.unloadAsync();
          return;
        }

        // Set update interval to 50ms for smooth word tracking
        await newSound.setProgressUpdateIntervalAsync(50);

        soundRef.current = newSound;
        setSound(newSound);
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    }

    loadAudio();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [audioSource, onPlaybackStatusUpdate]);

  // Web-specific: Poll for position updates since expo-av callbacks don't work reliably
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    if (isPlaying && soundRef.current) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          if (!soundRef.current) return;
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.positionMillis !== undefined) {
            const timeMs = status.positionMillis;
            // Inline position calculation to avoid stale closure issues
            const position = findCurrentPosition(timeMs);
            setCurrentTimeMs(timeMs);
            setCurrentPosition(position);

            // Check if finished
            if (status.didJustFinish) {
              setIsPlaying(false);
              setCurrentTimeMs(0);
              setCurrentPosition(null);
            }
          }
        } catch (error) {
          // Sound might be unloaded, ignore
        }
      }, 50);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isPlaying, findCurrentPosition]);

  const play = useCallback(async () => {
    if (sound) {
      await sound.playAsync();
      // On web, explicitly set isPlaying since callbacks may not fire
      if (Platform.OS === 'web') {
        setIsPlaying(true);
      }
    }
  }, [sound]);

  const pause = useCallback(async () => {
    if (sound) {
      await sound.pauseAsync();
      // On web, explicitly set isPlaying since callbacks may not fire
      if (Platform.OS === 'web') {
        setIsPlaying(false);
      }
    }
  }, [sound]);

  const seek = useCallback(
    async (timeMs: number) => {
      if (sound && isFinite(timeMs) && timeMs >= 0) {
        await sound.setPositionAsync(timeMs);
        // On web, update position immediately for responsiveness
        if (Platform.OS === 'web') {
          updatePosition(timeMs);
        }
      }
    },
    [sound, updatePosition]
  );

  const skipForward = useCallback(
    async (seconds: number = 10) => {
      if (sound && isFinite(duration)) {
        const newPosition = Math.min(currentTimeMs + seconds * 1000, duration);
        await sound.setPositionAsync(newPosition);
        if (Platform.OS === 'web') {
          updatePosition(newPosition);
        }
      }
    },
    [sound, currentTimeMs, duration, updatePosition]
  );

  const skipBackward = useCallback(
    async (seconds: number = 10) => {
      if (sound) {
        const newPosition = Math.max(currentTimeMs - seconds * 1000, 0);
        await sound.setPositionAsync(newPosition);
        if (Platform.OS === 'web') {
          updatePosition(newPosition);
        }
      }
    },
    [sound, currentTimeMs, updatePosition]
  );

  return {
    isPlaying,
    isLoaded,
    currentTimeMs,
    duration,
    currentPosition,
    play,
    pause,
    seek,
    skipForward,
    skipBackward,
  };
}
