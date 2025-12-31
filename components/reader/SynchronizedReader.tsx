import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, LayoutChangeEvent, Pressable } from 'react-native';
import { Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudioSync } from './useAudioSync';
import { useBackgroundMusic } from './useBackgroundMusic';
import { ReaderParagraph } from './ReaderParagraph';
import { ReaderControls } from './ReaderControls';
import { BackgroundMusicSettings } from './BackgroundMusicSettings';
import type { ReadingData } from './types';

interface SynchronizedReaderProps {
  readingData: ReadingData;
  audioSource: number | { uri: string };
}

export function SynchronizedReader({
  readingData,
  audioSource,
}: SynchronizedReaderProps) {
  const {
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
  } = useAudioSync(readingData, audioSource);

  const backgroundMusic = useBackgroundMusic();
  const [showMusicSettings, setShowMusicSettings] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const sentencePositions = useRef<Map<string, number>>(new Map());
  const lastScrolledSentence = useRef<string | null>(null);
  const scrollViewHeight = useRef<number>(0);

  // Track sentence positions for auto-scroll
  const handleSentenceLayout = useCallback((paragraphIndex: number, sentenceIndex: number, y: number) => {
    const key = `${paragraphIndex}-${sentenceIndex}`;
    sentencePositions.current.set(key, y);
  }, []);

  // Auto-scroll to current sentence
  useEffect(() => {
    if (!currentPosition || !isPlaying) return;

    const key = `${currentPosition.paragraphIndex}-${currentPosition.sentenceIndex}`;

    // Only scroll when sentence changes
    if (key === lastScrolledSentence.current) return;
    lastScrolledSentence.current = key;

    const sentenceY = sentencePositions.current.get(key);
    if (sentenceY !== undefined && scrollViewRef.current) {
      // Scroll to position with some padding from top (center the sentence roughly)
      const scrollTarget = Math.max(0, sentenceY - scrollViewHeight.current / 3);
      scrollViewRef.current.scrollTo({
        y: scrollTarget,
        animated: true,
      });
    }
  }, [currentPosition, isPlaying]);

  const handleScrollViewLayout = useCallback((event: LayoutChangeEvent) => {
    scrollViewHeight.current = event.nativeEvent.layout.height;
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with music button */}
      <View style={styles.header}>
        <Pressable
          style={styles.musicButton}
          onPress={() => setShowMusicSettings(true)}
          accessibilityRole="button"
          accessibilityLabel="Background music settings"
        >
          <MaterialIcons
            name={backgroundMusic.isEnabled ? 'music-note' : 'music-off'}
            size={24}
            color={backgroundMusic.isEnabled ? '#0d7377' : '#9BA1A6'}
          />
        </Pressable>
      </View>

      {/* Loading indicator */}
      {!isLoaded && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d7377" />
          <Text style={styles.loadingText}>Loading audio...</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onLayout={handleScrollViewLayout}
      >
        {readingData.paragraphs.map((paragraph, idx) => (
          <ReaderParagraph
            key={idx}
            paragraph={paragraph}
            paragraphIndex={idx}
            currentPosition={currentPosition}
            onSentenceLayout={handleSentenceLayout}
          />
        ))}
        {/* Bottom padding for controls */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Controls */}
      <ReaderControls
        isPlaying={isPlaying}
        isLoaded={isLoaded}
        currentTime={currentTimeMs}
        duration={duration}
        onPlay={play}
        onPause={pause}
        onSeek={seek}
        onSkipForward={() => skipForward(10)}
        onSkipBackward={() => skipBackward(10)}
      />

      {/* Background Music Settings */}
      <BackgroundMusicSettings
        visible={showMusicSettings}
        onClose={() => setShowMusicSettings(false)}
        isEnabled={backgroundMusic.isEnabled}
        volume={backgroundMusic.volume}
        currentTrackId={backgroundMusic.currentTrackId}
        availableTracks={backgroundMusic.availableTracks}
        onToggleEnabled={backgroundMusic.toggle}
        onSelectTrack={backgroundMusic.selectTrack}
        onVolumeChange={backgroundMusic.setVolume}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  musicButton: {
    padding: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9BA1A6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  bottomSpacer: {
    height: 120,
  },
});
