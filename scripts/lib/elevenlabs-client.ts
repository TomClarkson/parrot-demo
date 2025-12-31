import type { ElevenLabsResponse } from './types';

// Default voice: Rachel (a commonly used ElevenLabs voice)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export class ElevenLabsClient {
  private apiKey: string;
  private voiceId: string;

  constructor(apiKey: string, voiceId: string = DEFAULT_VOICE_ID) {
    if (!apiKey) {
      throw new Error('ELEVEN_LABS_API_KEY is required');
    }
    this.apiKey = apiKey;
    this.voiceId = voiceId;
  }

  async generateWithTimestamps(text: string): Promise<ElevenLabsResponse> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/with-timestamps`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<ElevenLabsResponse>;
  }
}
