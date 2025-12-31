import React, { useRef, useEffect, useCallback, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, LayoutChangeEvent, Pressable } from 'react-native';
import { Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudioSync } from './useAudioSync';
import { useBackgroundMusic } from './useBackgroundMusic';
import { ReaderParagraph } from './ReaderParagraph';
import { ReaderControls } from './ReaderControls';
import { BackgroundMusicSettings } from './BackgroundMusicSettings';
import type { ReadingData } from './types';
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useSharedValue, runOnJS } from 'react-native-reanimated';

interface SynchronizedReaderProps {
  readingData: ReadingData;
  audioSource: number | { uri: string };
}

const CONTROLS_HIDE_DELAY = 3000; // Hide controls after 3 seconds of inactivity

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
  const [controlsVisible, setControlsVisible] = useState(true);

  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const sentencePositions = useRef<Map<string, number>>(new Map());
  const lastScrolledSentence = useRef<string | null>(null);
  const scrollViewHeight = useRef<number>(0);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrolling = useSharedValue(false);
  const lastScrollY = useSharedValue(0);

  // Reset hide timer
  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  // Show controls and reset timer
  const showControls = useCallback(() => {
    setControlsVisible(true);
    resetHideTimer();
  }, [resetHideTimer]);

  // Hide controls immediately
  const hideControls = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    setControlsVisible(false);
  }, []);

  // Handle scroll events
  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isScrolling.value = true;
      runOnJS(hideControls)();
    },
    onEndDrag: () => {
      isScrolling.value = false;
    },
    onMomentumEnd: () => {
      isScrolling.value = false;
    },
    onScroll: (event) => {
      lastScrollY.value = event.contentOffset.y;
    },
  });

  // Handle tap on content area to toggle controls
  const handleContentPress = useCallback(() => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  }, [controlsVisible, hideControls, showControls]);

  // Initial timer setup
  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [resetHideTimer]);

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
      (scrollViewRef.current as any).scrollTo({
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
      <Pressable style={styles.contentPressable} onPress={handleContentPress}>
        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onLayout={handleScrollViewLayout}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
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
        </Animated.ScrollView>
      </Pressable>

      {/* Controls */}
      <ReaderControls
        isPlaying={isPlaying}
        isLoaded={isLoaded}
        currentTime={currentTimeMs}
        duration={duration}
        visible={controlsVisible}
        onPlay={() => { play(); showControls(); }}
        onPause={() => { pause(); showControls(); }}
        onSeek={(time) => { seek(time); showControls(); }}
        onSkipForward={() => { skipForward(10); showControls(); }}
        onSkipBackward={() => { skipBackward(10); showControls(); }}
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
  contentPressable: {
    flex: 1,
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
