export interface Word {
  text: string;
  startTime: number;
  endTime: number;
}

export interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  words: Word[];
}

export interface Paragraph {
  text: string;
  startTime: number;
  endTime: number;
  sentences: Sentence[];
}

export interface WordTimelineEntry {
  startTime: number;
  endTime: number;
  paragraphIndex: number;
  sentenceIndex: number;
  wordIndex: number;
}

export interface ReadingData {
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

export interface CurrentPosition {
  paragraphIndex: number;
  sentenceIndex: number;
  wordIndex: number;
}
