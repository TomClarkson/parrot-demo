import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import type { BackgroundMusicTrack } from './useBackgroundMusic';

interface BackgroundMusicSettingsProps {
  visible: boolean;
  onClose: () => void;
  isEnabled: boolean;
  volume: number;
  currentTrackId: string | null;
  availableTracks: BackgroundMusicTrack[];
  onToggleEnabled: () => void;
  onSelectTrack: (trackId: string) => void;
  onVolumeChange: (volume: number) => void;
}

export function BackgroundMusicSettings({
  visible,
  onClose,
  isEnabled,
  volume,
  currentTrackId,
  availableTracks,
  onToggleEnabled,
  onSelectTrack,
  onVolumeChange,
}: BackgroundMusicSettingsProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Background Music</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#ECEDEE" />
            </Pressable>
          </View>

          {/* Enable toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Enable Background Music</Text>
            <Switch
              value={isEnabled}
              onValueChange={onToggleEnabled}
              trackColor={{ false: '#3e3e3e', true: '#0d7377' }}
              thumbColor={isEnabled ? '#ECEDEE' : '#9BA1A6'}
            />
          </View>

          {/* Track selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Track</Text>
            {availableTracks.map((track) => (
              <Pressable
                key={track.id}
                style={styles.trackRow}
                onPress={() => onSelectTrack(track.id)}
              >
                <View style={styles.radioOuter}>
                  {currentTrackId === track.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.trackName}>{track.name}</Text>
              </Pressable>
            ))}
          </View>

          {/* Volume slider */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Volume: {Math.round(volume * 100)}%
            </Text>
            <Slider
              style={styles.slider}
              value={volume}
              minimumValue={0}
              maximumValue={1}
              step={0.05}
              onValueChange={onVolumeChange}
              minimumTrackTintColor="#0d7377"
              maximumTrackTintColor="rgba(255,255,255,0.2)"
              thumbTintColor="#ECEDEE"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1d1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  closeButton: {
    padding: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontSize: 16,
    color: '#ECEDEE',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0d7377',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0d7377',
  },
  trackName: {
    fontSize: 16,
    color: '#ECEDEE',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
