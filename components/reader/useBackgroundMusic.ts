import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

export interface BackgroundMusicTrack {
  id: string;
  name: string;
  source: number | { uri: string };
}

interface UseBackgroundMusicResult {
  isLoaded: boolean;
  isEnabled: boolean;
  volume: number;
  currentTrackId: string | null;
  availableTracks: BackgroundMusicTrack[];
  selectTrack: (trackId: string) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  toggle: () => Promise<void>;
}

// Built-in background music tracks (using URLs for POC)
const BACKGROUND_TRACKS: BackgroundMusicTrack[] = [
  {
    id: 'lofi-study',
    name: 'Lofi Study',
    source: { uri: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
  },
  {
    id: 'ambient-piano',
    name: 'Ambient Piano',
    source: { uri: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc26c67.mp3' },
  },
  {
    id: 'peaceful-garden',
    name: 'Peaceful Garden',
    source: { uri: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3' },
  },
];

const DEFAULT_VOLUME = 0.3;

export function useBackgroundMusic(): UseBackgroundMusicResult {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Load and play a track
  const loadTrack = useCallback(async (trackId: string) => {
    const track = BACKGROUND_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    // Unload existing sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setSound(null);
      setIsLoaded(false);
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        track.source,
        {
          shouldPlay: isEnabled,
          isLooping: true,
          volume: volume,
        }
      );

      soundRef.current = newSound;
      setSound(newSound);
      setIsLoaded(true);
      setCurrentTrackId(trackId);
    } catch (error) {
      console.error('Error loading background music:', error);
    }
  }, [isEnabled, volume]);

  // Select a track
  const selectTrack = useCallback(async (trackId: string) => {
    await loadTrack(trackId);
  }, [loadTrack]);

  // Set volume
  const setVolume = useCallback(async (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(clampedVolume);
    }
  }, []);

  // Enable music playback
  const enable = useCallback(async () => {
    setIsEnabled(true);

    // If no track selected, select the first one
    if (!currentTrackId && BACKGROUND_TRACKS.length > 0) {
      await loadTrack(BACKGROUND_TRACKS[0].id);
    } else if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, [currentTrackId, loadTrack]);

  // Disable music playback
  const disable = useCallback(async () => {
    setIsEnabled(false);

    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  // Toggle music playback
  const toggle = useCallback(async () => {
    if (isEnabled) {
      await disable();
    } else {
      await enable();
    }
  }, [isEnabled, enable, disable]);

  // Start/stop playback when enabled state changes
  useEffect(() => {
    if (!soundRef.current || !isLoaded) return;

    if (isEnabled) {
      soundRef.current.playAsync();
    } else {
      soundRef.current.pauseAsync();
    }
  }, [isEnabled, isLoaded]);

  return {
    isLoaded,
    isEnabled,
    volume,
    currentTrackId,
    availableTracks: BACKGROUND_TRACKS,
    selectTrack,
    setVolume,
    enable,
    disable,
    toggle,
  };
}
