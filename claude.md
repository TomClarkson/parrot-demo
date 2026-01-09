# Parrot Stories

## Overview
Parrot Stories is a prototype app for learning languages through bilingual stories. Built with Expo Router and TypeScript.

**Key Features:**
- **Synchronized audio reading** - Word and sentence highlighting synced to audio (pre-generated with ElevenLabs)
- **AI story generation** - Users can generate their own stories with streaming text
- **Client-side AI** - Prototyping AI functionality using OpenRouter

## Package Manager
**Use bun** for all package management and script running.
- Install: `bun add <package>` or `bun add -d <package>` for dev dependencies
- Run scripts: `bun run <script>` or `bun <script>`
- Expo install: `bunx expo install <package>`

## AI Story Generation

Stories can be generated client-side using OpenRouter:

```typescript
import { useStoryGeneration } from "@/hooks/useStoryGeneration";

const { text, isGenerating, generate } = useStoryGeneration();
await generate("A brave knight who befriends a dragon");
```

**Configuration:**
- API key: `EXPO_PUBLIC_OPENROUTER_API_KEY` in `.env`
- Default model: `meta-llama/llama-3.2-3b-instruct:free`
- Streaming: Uses `expo/fetch` for SSE streaming on mobile

## Audio Generation Script

Generate synchronized audio and timing data from text files:

```bash
bun run generate-audio <input.txt>
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
  (tabs)/
    index.tsx          # Home - story list
    create.tsx         # AI story generation
    explore.tsx        # App info
  reader/[id].tsx      # Synchronized reader (dynamic route)
components/
  reader/              # Synchronized reader components
    SynchronizedReader.tsx
    ReaderSentence.tsx
    ReaderWord.tsx
    ReaderControls.tsx
    useAudioSync.ts
hooks/
  useStoryGeneration.ts  # OpenRouter streaming hook
constants/             # Theme colors and constants
scripts/
  generate-audio.ts    # Audio generation script
  lib/
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
