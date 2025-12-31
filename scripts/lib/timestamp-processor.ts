import type {
  ElevenLabsAlignment,
  ReadingData,
  Paragraph,
  Sentence,
  Word,
  WordTimelineEntry,
} from './types';

interface CharTiming {
  char: string;
  startMs: number;
  endMs: number;
}

export function processTimestamps(
  text: string,
  alignment: ElevenLabsAlignment,
  voiceId: string
): ReadingData {
  // Convert character times to milliseconds
  const charTimings: CharTiming[] = alignment.characters.map((char, i) => ({
    char,
    startMs: Math.round(alignment.character_start_times_seconds[i] * 1000),
    endMs: Math.round(alignment.character_end_times_seconds[i] * 1000),
  }));

  // Split text into paragraphs (double newlines or more)
  const paragraphTexts = text.split(/\n\n+/).filter((p) => p.trim());

  let charIndex = 0;
  const paragraphs: Paragraph[] = [];
  const wordTimeline: WordTimelineEntry[] = [];

  paragraphTexts.forEach((paraText, paraIdx) => {
    const sentences: Sentence[] = [];
    const sentenceTexts = splitIntoSentences(paraText);

    sentenceTexts.forEach((sentenceText, sentIdx) => {
      const words: Word[] = [];
      const wordTexts = sentenceText.split(/\s+/).filter((w) => w);

      wordTexts.forEach((wordText, wordIdx) => {
        // Skip whitespace characters in alignment
        while (
          charIndex < charTimings.length &&
          /\s/.test(charTimings[charIndex].char)
        ) {
          charIndex++;
        }

        const wordStartMs = charTimings[charIndex]?.startMs ?? 0;
        let wordEndMs = wordStartMs;

        // Match characters for this word
        let matchedChars = 0;
        const cleanWord = wordText.replace(/[^\w''-]/g, ''); // Remove punctuation for matching

        while (charIndex < charTimings.length && matchedChars < wordText.length) {
          const charTiming = charTimings[charIndex];

          // Skip whitespace
          if (/\s/.test(charTiming.char)) {
            charIndex++;
            continue;
          }

          wordEndMs = charTiming.endMs;
          charIndex++;
          matchedChars++;

          // If we've matched the core word characters, check if next is punctuation
          if (matchedChars >= cleanWord.length) {
            // Consume trailing punctuation that's part of the word
            while (
              charIndex < charTimings.length &&
              /[.,!?;:'")\]}]/.test(charTimings[charIndex].char)
            ) {
              wordEndMs = charTimings[charIndex].endMs;
              charIndex++;
              matchedChars++;
            }
            break;
          }
        }

        const word: Word = {
          text: wordText,
          startTime: wordStartMs,
          endTime: wordEndMs,
        };

        words.push(word);
        wordTimeline.push({
          startTime: wordStartMs,
          endTime: wordEndMs,
          paragraphIndex: paraIdx,
          sentenceIndex: sentIdx,
          wordIndex: wordIdx,
        });
      });

      if (words.length > 0) {
        const sentence: Sentence = {
          text: sentenceText,
          startTime: words[0].startTime,
          endTime: words[words.length - 1].endTime,
          words,
        };
        sentences.push(sentence);
      }
    });

    if (sentences.length > 0) {
      paragraphs.push({
        text: paraText,
        startTime: sentences[0].startTime,
        endTime: sentences[sentences.length - 1].endTime,
        sentences,
      });
    }
  });

  const totalDuration =
    charTimings.length > 0 ? charTimings[charTimings.length - 1].endMs : 0;

  return {
    title: extractTitle(text),
    totalDuration,
    paragraphs,
    wordTimeline,
    metadata: {
      voiceId,
      generatedAt: new Date().toISOString(),
      wordCount: wordTimeline.length,
      sentenceCount: paragraphs.reduce((sum, p) => sum + p.sentences.length, 0),
    },
  };
}

function splitIntoSentences(text: string): string[] {
  // Match sentence-ending punctuation followed by space or end of string
  const sentences: string[] = [];
  let currentSentence = '';

  const chars = text.split('');
  for (let i = 0; i < chars.length; i++) {
    currentSentence += chars[i];

    // Check for sentence boundary
    if (/[.!?]/.test(chars[i])) {
      // Look ahead: is this really end of sentence?
      const nextChar = chars[i + 1];
      const nextNextChar = chars[i + 2];

      // End of text
      if (nextChar === undefined) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
        continue;
      }

      // Followed by space and capital letter (or end)
      if (/\s/.test(nextChar)) {
        // Check if next non-space char is capital or end
        let j = i + 1;
        while (j < chars.length && /\s/.test(chars[j])) j++;

        if (j >= chars.length || /[A-Z"'"']/.test(chars[j])) {
          sentences.push(currentSentence.trim());
          currentSentence = '';
          continue;
        }
      }

      // Handle closing quotes after punctuation
      if (/["'"']/.test(nextChar)) {
        currentSentence += nextChar;
        i++;
        if (chars[i + 1] === undefined || /\s/.test(chars[i + 1])) {
          sentences.push(currentSentence.trim());
          currentSentence = '';
        }
      }
    }
  }

  // Add any remaining text
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  return sentences.filter((s) => s.length > 0);
}

function extractTitle(text: string): string {
  // Use first line or first few words as title
  const firstLine = text.split('\n')[0].trim();
  if (firstLine.length <= 50) {
    return firstLine;
  }
  return firstLine.substring(0, 47) + '...';
}
