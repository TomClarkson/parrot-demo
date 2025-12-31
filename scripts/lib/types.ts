export interface Word {
  text: string;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
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
  totalDuration: number; // milliseconds
  paragraphs: Paragraph[];
  wordTimeline: WordTimelineEntry[];
  metadata: {
    voiceId: string;
    generatedAt: string;
    wordCount: number;
    sentenceCount: number;
  };
}

export interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface ElevenLabsResponse {
  audio_base64: string;
  alignment: ElevenLabsAlignment;
  normalized_alignment?: ElevenLabsAlignment;
}
