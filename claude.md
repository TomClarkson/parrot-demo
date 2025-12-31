# Parrot Demo - ElevenLabs Synchronized Reader

## Overview
Expo Router project with TypeScript implementing synchronized audio reading with word and sentence highlighting. Works in Expo Go and Expo Web.

## Package Manager
**Use bun** for all package management and script running.
- Install: `bun add <package>` or `bun add -d <package>` for dev dependencies
- Run scripts: `bun run <script>` or `bun <script>`
- Expo install: `bunx expo install <package>`

## Audio Generation Script

Generate audio and timing data from text files:

```bash
bun run generate-audio <input.txt>
# or directly:
bun scripts/generate-audio.ts story.txt
```

**Outputs to `assets/readings/`:**
- `{filename}.mp3` - Audio file
- `{filename}.json` - Timing data with word/sentence timestamps

**Environment:**
- Requires `ELEVEN_LABS_API_KEY` in `.env`
- Uses default voice: Rachel (21m00Tcm4TlvDq8ikWAM)

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/              # Tab navigation
  reader/[id].tsx      # Reader screen (dynamic route)
components/
  reader/              # Synchronized reader components
    SynchronizedReader.tsx
    ReaderSentence.tsx
    ReaderWord.tsx
    ReaderControls.tsx
    useAudioSync.ts
hooks/                 # Custom React hooks
constants/             # Theme colors and constants
scripts/
  generate-audio.ts    # Audio generation script
  lib/
    types.ts           # Shared TypeScript types
    elevenlabs-client.ts
    timestamp-processor.ts
assets/
  readings/            # Generated audio and JSON files
```

## Key Patterns

- **Path alias**: `@/*` maps to project root
- **Themed components**: Use `ThemedText`, `ThemedView`
- **Theme hooks**: `useThemeColor`, `useColorScheme`
- **Animations**: `react-native-reanimated` for smooth highlighting

## Audio Playback

- Library: `expo-av` (cross-platform: Expo Go + Web)
- Update interval: 50ms for smooth word highlighting
- Position tracking: Binary search on pre-sorted timeline arrays

## Timing Data Format

```typescript
interface ReadingData {
  title: string;
  totalDuration: number; // milliseconds
  paragraphs: Paragraph[];
  wordTimeline: WordTimelineEntry[]; // Flattened for O(log n) lookups
  metadata: { voiceId, generatedAt, wordCount, sentenceCount };
}
```
