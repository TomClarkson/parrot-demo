import { useState, useCallback } from 'react';
import { fetch } from 'expo/fetch';
import { WordInfo } from '@/types/bilingual';
import { SupportedLanguage, LANGUAGE_CONFIG } from '@/types/settings';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.2-3b-instruct:free';

const getWordLookupPrompt = (word: string, sentence: string, targetLanguage: string) => `
Provide information about the ${targetLanguage} word/character "${word}" used in this sentence: "${sentence}"

Respond in JSON format only (no markdown, no explanation):
{
  "word": "${word}",
  "translation": "English translation of this word",
  "partOfSpeech": "noun/verb/adjective/adverb/etc",
  "pronunciation": "phonetic pronunciation or pinyin if Chinese"
}

Output ONLY valid JSON.`;

export function useWordLookup(targetLanguage: SupportedLanguage) {
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languageLabel = LANGUAGE_CONFIG[targetLanguage].label;

  const lookup = useCallback(
    async (word: string, sentenceContext: string) => {
      const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
      if (!apiKey) {
        setError('OpenRouter API key not configured');
        return;
      }

      // Clean the word (remove punctuation)
      const cleanWord = word.replace(/[.,!?;:'"。，！？；：「」『』]/g, '').trim();
      if (!cleanWord) {
        return;
      }

      setIsLoading(true);
      setError(null);
      setWordInfo(null);

      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://parrot-demo.app',
            'X-Title': 'Parrot Demo',
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages: [
              {
                role: 'user',
                content: getWordLookupPrompt(cleanWord, sentenceContext, languageLabel),
              },
            ],
            max_tokens: 256,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          const parsed = parseWordInfo(content);
          if (parsed) {
            setWordInfo(parsed);
          } else {
            throw new Error('Failed to parse word info');
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to look up word';
        setError(message);
        console.error('Word lookup error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [languageLabel]
  );

  const clear = useCallback(() => {
    setWordInfo(null);
    setError(null);
  }, []);

  return {
    wordInfo,
    isLoading,
    error,
    lookup,
    clear,
  };
}

function parseWordInfo(text: string): WordInfo | null {
  try {
    let jsonStr = text.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    // Find JSON object
    const startIndex = jsonStr.indexOf('{');
    const endIndex = jsonStr.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      jsonStr = jsonStr.slice(startIndex, endIndex + 1);
    }

    const parsed = JSON.parse(jsonStr);

    return {
      word: parsed.word || '',
      translation: parsed.translation || '',
      partOfSpeech: parsed.partOfSpeech,
      pronunciation: parsed.pronunciation,
    };
  } catch (err) {
    console.error('Word info parse error:', err);
    return null;
  }
}
