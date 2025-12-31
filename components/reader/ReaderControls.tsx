import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ReaderControlsProps {
  isPlaying: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (timeMs: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const TINT_COLOR = '#0d7377';

export function ReaderControls({
  isPlaying,
  isLoaded,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
}: ReaderControlsProps) {
  const progress = duration > 0 ? currentTime / duration : 0;

  const handleProgressPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const width = event.currentTarget?.clientWidth || 300;
    const seekPosition = (locationX / width) * duration;
    onSeek(Math.max(0, Math.min(seekPosition, duration)));
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <Pressable style={styles.progressContainer} onPress={handleProgressPress}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>
      </Pressable>

      {/* Time and controls */}
      <View style={styles.controlsRow}>
        <Text style={styles.time}>{formatTime(currentTime)}</Text>

        <View style={styles.buttonsContainer}>
          {/* Skip backward */}
          <Pressable
            style={styles.skipButton}
            onPress={onSkipBackward}
            disabled={!isLoaded}
          >
            <MaterialIcons name="replay-10" size={28} color="#ECEDEE" />
          </Pressable>

          {/* Play/Pause */}
          <Pressable
            style={[styles.playButton, !isLoaded && styles.buttonDisabled]}
            onPress={isPlaying ? onPause : onPlay}
            disabled={!isLoaded}
          >
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              color="#FFFFFF"
            />
          </Pressable>

          {/* Skip forward */}
          <Pressable
            style={styles.skipButton}
            onPress={onSkipForward}
            disabled={!isLoaded}
          >
            <MaterialIcons name="forward-10" size={28} color="#ECEDEE" />
          </Pressable>
        </View>

        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1d1e',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  progressContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: TINT_COLOR,
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 14,
    color: '#9BA1A6',
    minWidth: 45,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TINT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
