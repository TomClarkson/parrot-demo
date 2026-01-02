import * as fs from 'fs';
import * as path from 'path';

interface Word {
  text: string;
  startTime: number;
  endTime: number;
}

interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  words: Word[];
}

interface Paragraph {
  text: string;
  startTime: number;
  endTime: number;
  sentences: Sentence[];
}

interface WordTimelineEntry {
  startTime: number;
  endTime: number;
  paragraphIndex: number;
  sentenceIndex: number;
  wordIndex: number;
}

interface ReadingData {
  title: string;
  totalDuration: number;
  paragraphs: Paragraph[];
  wordTimeline: WordTimelineEntry[];
  metadata: {
    voiceId: string;
    generatedAt: string;
    wordCount: number;
    sentenceCount: number;
  };
}

// Average word duration in ms (based on ~150 words per minute)
const AVG_WORD_DURATION = 350;
const WORD_GAP = 80;
const SENTENCE_GAP = 300;
const PARAGRAPH_GAP = 600;

function splitIntoSentences(text: string): string[] {
  const sentences: string[] = [];
  let currentSentence = '';
  const chars = text.split('');

  for (let i = 0; i < chars.length; i++) {
    currentSentence += chars[i];

    if (/[.!?]/.test(chars[i])) {
      const nextChar = chars[i + 1];

      if (nextChar === undefined) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
        continue;
      }

      if (/\s/.test(nextChar)) {
        let j = i + 1;
        while (j < chars.length && /\s/.test(chars[j])) j++;

        if (j >= chars.length || /[A-Z"'"']/.test(chars[j])) {
          sentences.push(currentSentence.trim());
          currentSentence = '';
          continue;
        }
      }
    }
  }

  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  return sentences.filter((s) => s.length > 0);
}

function generateTimestamps(text: string): ReadingData {
  const paragraphTexts = text.split(/\n\n+/).filter((p) => p.trim());

  let currentTime = 0;
  const paragraphs: Paragraph[] = [];
  const wordTimeline: WordTimelineEntry[] = [];

  paragraphTexts.forEach((paraText, paraIdx) => {
    const sentences: Sentence[] = [];
    const sentenceTexts = splitIntoSentences(paraText);

    sentenceTexts.forEach((sentenceText, sentIdx) => {
      const words: Word[] = [];
      const wordTexts = sentenceText.split(/\s+/).filter((w) => w);

      wordTexts.forEach((wordText, wordIdx) => {
        // Calculate word duration based on length (longer words = more time)
        const baseDuration = AVG_WORD_DURATION;
        const lengthBonus = Math.min(wordText.length * 20, 200);
        const wordDuration = baseDuration + lengthBonus;

        const word: Word = {
          text: wordText,
          startTime: currentTime,
          endTime: currentTime + wordDuration,
        };

        words.push(word);
        wordTimeline.push({
          startTime: currentTime,
          endTime: currentTime + wordDuration,
          paragraphIndex: paraIdx,
          sentenceIndex: sentIdx,
          wordIndex: wordIdx,
        });

        currentTime += wordDuration + WORD_GAP;
      });

      if (words.length > 0) {
        sentences.push({
          text: sentenceText,
          startTime: words[0].startTime,
          endTime: words[words.length - 1].endTime,
          words,
        });

        // Add gap between sentences
        currentTime += SENTENCE_GAP;
      }
    });

    if (sentences.length > 0) {
      paragraphs.push({
        text: paraText,
        startTime: sentences[0].startTime,
        endTime: sentences[sentences.length - 1].endTime,
        sentences,
      });

      // Add gap between paragraphs
      currentTime += PARAGRAPH_GAP;
    }
  });

  const title = text.split('\n')[0].trim();
  const totalDuration = wordTimeline.length > 0
    ? wordTimeline[wordTimeline.length - 1].endTime
    : 0;

  return {
    title,
    totalDuration,
    paragraphs,
    wordTimeline,
    metadata: {
      voiceId: 'placeholder',
      generatedAt: new Date().toISOString(),
      wordCount: wordTimeline.length,
      sentenceCount: paragraphs.reduce((sum, p) => sum + p.sentences.length, 0),
    },
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: bun scripts/generate-local-timestamps.ts <input.txt>');
    process.exit(1);
  }

  const inputPath = args[0];
  const resolvedInputPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);

  if (!fs.existsSync(resolvedInputPath)) {
    console.error(`Error: File not found: ${resolvedInputPath}`);
    process.exit(1);
  }

  console.log(`Reading input file: ${resolvedInputPath}`);
  const text = fs.readFileSync(resolvedInputPath, 'utf-8');

  if (!text.trim()) {
    console.error('Error: Input file is empty');
    process.exit(1);
  }

  console.log(`Text length: ${text.length} characters`);
  console.log('Generating estimated timestamps...');

  const readingData = generateTimestamps(text);

  console.log(`Processed: ${readingData.metadata.wordCount} words, ${readingData.metadata.sentenceCount} sentences`);
  console.log(`Estimated duration: ${(readingData.totalDuration / 1000).toFixed(2)} seconds`);

  const baseName = path.basename(resolvedInputPath, path.extname(resolvedInputPath));
  const outputDir = path.resolve(__dirname, '../assets/readings');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const jsonPath = path.join(outputDir, `${baseName}.json`);

  console.log(`Saving timing data to: ${jsonPath}`);
  fs.writeFileSync(jsonPath, JSON.stringify(readingData, null, 2));

  console.log('\nDone! Generated file:');
  console.log(`  JSON:  ${jsonPath}`);
  console.log('\nNote: This uses estimated timestamps. For accurate timestamps,');
  console.log('regenerate with the ElevenLabs API when network access is available.');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
