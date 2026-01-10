import { useState, useCallback } from 'react';
import { fetch } from 'expo/fetch';
import { BilingualContent, BilingualParagraph } from '@/types/bilingual';
import { SupportedLanguage, LANGUAGE_CONFIG } from '@/types/settings';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.2-3b-instruct:free';

const getBilingualSystemPrompt = (targetLanguage: string) => `You are a creative bilingual children's story writer. Write engaging, age-appropriate stories that are fun to read aloud.

OUTPUT FORMAT:
You MUST output valid JSON with this exact structure (no markdown, no explanation, just JSON):
{
  "title": "English Title",
  "titleTranslation": "Title in ${targetLanguage}",
  "paragraphs": [
    {
      "sentences": [
        {
          "english": "First English sentence.",
          "translation": "First ${targetLanguage} sentence."
        },
        {
          "english": "Second English sentence.",
          "translation": "Second ${targetLanguage} sentence."
        }
      ]
    }
  ]
}

RULES:
1. Keep stories between 100-200 words (English side)
2. Each sentence pair must be a complete thought
3. Use simple, clear language appropriate for language learners
4. Translations should be natural, not word-for-word literal
5. Include 2-4 paragraphs with 2-3 sentences each
6. Use vivid descriptions and dialogue to keep the story engaging
7. Output ONLY valid JSON, no markdown code blocks or explanation

TARGET LANGUAGE: ${targetLanguage}`;

interface UseBilingualStoryGenerationOptions {
  model?: string;
}

export function useBilingualStoryGeneration(
  targetLanguage: SupportedLanguage,
  options?: UseBilingualStoryGenerationOptions
) {
  const [content, setContent] = useState<BilingualContent | null>(null);
  const [rawText, setRawText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const model = options?.model || DEFAULT_MODEL;
  const languageLabel = LANGUAGE_CONFIG[targetLanguage].label;

  const generate = useCallback(
    async (prompt: string) => {
      const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
      if (!apiKey) {
        setError('OpenRouter API key not configured');
        return;
      }

      setIsGenerating(true);
      setError(null);
      setContent(null);
      setRawText('');

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
            model,
            messages: [
              { role: 'system', content: getBilingualSystemPrompt(languageLabel) },
              { role: 'user', content: `Write a bilingual story about: ${prompt}` },
            ],
            stream: true,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API error: ${response.status} - ${errorData}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;
            if (trimmed === 'data: [DONE]') continue;

            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const chunk = json.choices?.[0]?.delta?.content;
                if (chunk) {
                  fullText += chunk;
                  setRawText(fullText);
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        }

        // Parse the complete JSON response
        const parsed = parseStoryJSON(fullText);
        if (parsed) {
          setContent(parsed);
        } else {
          throw new Error('Failed to parse story response');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate story';
        setError(message);
        console.error('Bilingual story generation error:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [model, languageLabel]
  );

  const clear = useCallback(() => {
    setContent(null);
    setRawText('');
    setError(null);
  }, []);

  return {
    content,
    rawText,
    isGenerating,
    error,
    generate,
    clear,
  };
}

function parseStoryJSON(text: string): BilingualContent | null {
  try {
    // Try to extract JSON from the text (in case there's extra text around it)
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

    // Find the start and end of JSON object
    const startIndex = jsonStr.indexOf('{');
    const endIndex = jsonStr.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      jsonStr = jsonStr.slice(startIndex, endIndex + 1);
    }

    // Replace smart quotes with standard quotes
    jsonStr = jsonStr
      .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
      .replace(/[\u201C\u201D]/g, '"'); // Smart double quotes

    // Try to parse directly first
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.title && parsed.titleTranslation && Array.isArray(parsed.paragraphs)) {
        return {
          title: parsed.title,
          titleTranslation: parsed.titleTranslation,
          paragraphs: parsed.paragraphs as BilingualParagraph[],
        };
      }
    } catch (e) {
      // If direct parse fails, try to fix common issues
      console.log('Direct parse failed, attempting repair...');
    }

    // Try to repair: find balanced braces
    let braceCount = 0;
    let jsonEnd = -1;
    for (let i = 0; i < jsonStr.length; i++) {
      if (jsonStr[i] === '{') braceCount++;
      if (jsonStr[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
    }

    if (jsonEnd > 0) {
      jsonStr = jsonStr.slice(0, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed.title && parsed.titleTranslation && Array.isArray(parsed.paragraphs)) {
        return {
          title: parsed.title,
          titleTranslation: parsed.titleTranslation,
          paragraphs: parsed.paragraphs as BilingualParagraph[],
        };
      }
    }

    console.error('Invalid story structure after repair attempt');
    return null;
  } catch (err) {
    console.error('JSON parse error:', err);
    return null;
  }
}
