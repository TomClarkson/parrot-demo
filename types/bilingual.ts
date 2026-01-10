import { SupportedLanguage } from './settings';

export interface BilingualSentence {
  english: string;
  translation: string;
}

export interface BilingualParagraph {
  sentences: BilingualSentence[];
}

export interface BilingualContent {
  title: string;
  titleTranslation: string;
  paragraphs: BilingualParagraph[];
}

export interface WordInfo {
  word: string;
  translation: string;
  partOfSpeech?: string;
  pronunciation?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}
