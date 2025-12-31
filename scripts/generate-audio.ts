import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { ElevenLabsClient } from './lib/elevenlabs-client';
import { processTimestamps } from './lib/timestamp-processor';

// Load environment variables from .env
config();

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - default voice

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx ts-node scripts/generate-audio.ts <input.txt>');
    console.error('Example: npx ts-node scripts/generate-audio.ts story.txt');
    process.exit(1);
  }

  const inputPath = args[0];

  // Resolve input path
  const resolvedInputPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);

  if (!fs.existsSync(resolvedInputPath)) {
    console.error(`Error: File not found: ${resolvedInputPath}`);
    process.exit(1);
  }

  // Read input text
  console.log(`Reading input file: ${resolvedInputPath}`);
  const text = fs.readFileSync(resolvedInputPath, 'utf-8');

  if (!text.trim()) {
    console.error('Error: Input file is empty');
    process.exit(1);
  }

  console.log(`Text length: ${text.length} characters`);

  // Initialize ElevenLabs client
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    console.error('Error: ELEVEN_LABS_API_KEY not found in environment variables');
    console.error('Make sure you have a .env file with ELEVEN_LABS_API_KEY=your_key');
    process.exit(1);
  }

  const client = new ElevenLabsClient(apiKey, VOICE_ID);

  // Generate audio with timestamps
  console.log('Generating audio with ElevenLabs API...');
  console.log(`Using voice ID: ${VOICE_ID}`);

  let response;
  try {
    response = await client.generateWithTimestamps(text);
  } catch (error) {
    console.error('Error calling ElevenLabs API:', error);
    process.exit(1);
  }

  console.log('Audio generated successfully');
  console.log(`Alignment data: ${response.alignment.characters.length} characters`);

  // Process timestamps into structured format
  console.log('Processing timestamps...');
  const readingData = processTimestamps(text, response.alignment, VOICE_ID);

  console.log(`Processed: ${readingData.metadata.wordCount} words, ${readingData.metadata.sentenceCount} sentences`);
  console.log(`Total duration: ${(readingData.totalDuration / 1000).toFixed(2)} seconds`);

  // Determine output paths
  const baseName = path.basename(resolvedInputPath, path.extname(resolvedInputPath));
  const outputDir = path.resolve(__dirname, '../assets/readings');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const audioPath = path.join(outputDir, `${baseName}.mp3`);
  const jsonPath = path.join(outputDir, `${baseName}.json`);

  // Save audio file
  console.log(`Saving audio to: ${audioPath}`);
  const audioBuffer = Buffer.from(response.audio_base64, 'base64');
  fs.writeFileSync(audioPath, audioBuffer);

  // Save JSON file
  console.log(`Saving timing data to: ${jsonPath}`);
  fs.writeFileSync(jsonPath, JSON.stringify(readingData, null, 2));

  console.log('\nDone! Generated files:');
  console.log(`  Audio: ${audioPath}`);
  console.log(`  JSON:  ${jsonPath}`);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
