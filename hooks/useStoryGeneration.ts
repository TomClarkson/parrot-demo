import { useState, useCallback } from "react";
import { fetch } from "expo/fetch";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.2-3b-instruct:free";

const STORY_SYSTEM_PROMPT = `You are a creative children's story writer. Write engaging, age-appropriate stories that are fun to read aloud.
Keep stories between 200-500 words unless asked otherwise.
Use vivid descriptions and simple language that children can understand.
Include dialogue and action to keep the story engaging.`;

interface UseStoryGenerationOptions {
  model?: string;
}

export function useStoryGeneration(options?: UseStoryGenerationOptions) {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const model = options?.model || DEFAULT_MODEL;

  const generate = useCallback(
    async (prompt: string) => {
      const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
      if (!apiKey) {
        setError("OpenRouter API key not configured");
        return;
      }

      setIsGenerating(true);
      setError(null);
      setText("");

      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://parrot-demo.app",
            "X-Title": "Parrot Demo",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: STORY_SYSTEM_PROMPT },
              { role: "user", content: `Write a story about: ${prompt}` },
            ],
            stream: true,
            max_tokens: 1024,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API error: ${response.status} - ${errorData}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;
            if (trimmed === "data: [DONE]") continue;

            if (trimmed.startsWith("data: ")) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  setText((prev) => prev + content);
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate story";
        setError(message);
        console.error("Story generation error:", err);
      } finally {
        setIsGenerating(false);
      }
    },
    [model]
  );

  const clear = useCallback(() => {
    setText("");
    setError(null);
  }, []);

  return {
    text,
    isGenerating,
    error,
    generate,
    clear,
  };
}
