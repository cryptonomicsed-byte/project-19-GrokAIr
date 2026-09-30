import CryptoJS from 'crypto-js';

const GROK_API_URL = process.env.GROK_API_URL || 'wss://api.x.ai/grok/realtime';
const GROK_API_KEY = process.env.GROK_API_KEY || '';

interface GrokMessage {
  type: 'text' | 'audio' | 'function_call';
  content: string;
  language?: string;
}

export class GrokRealtimeClient {
  private ws: WebSocket | null = null;
  private messageQueue: string[] = [];
  private onMessage: ((message: GrokMessage) => void) | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(GROK_API_URL, [
          `Bearer ${GROK_API_KEY}`,
        ]);

        this.ws.onopen = () => {
          console.log('Grok Realtime connected');
          // Process queued messages
          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg && this.ws) {
              this.ws.send(msg);
            }
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (this.onMessage) {
              this.onMessage(data);
            }
          } catch (e) {
            console.error('Failed to parse Grok message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Grok WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Grok Realtime disconnected');
          this.ws = null;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  sendAudio(audioData: ArrayBuffer, language: string = 'en'): void {
    const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(audioData))));
    const message = JSON.stringify({
      type: 'audio',
      content: base64Audio,
      language,
    });
    this.send(message);
  }

  sendText(text: string, targetLanguage: string): void {
    const message = JSON.stringify({
      type: 'text',
      content: text,
      targetLanguage,
      requestTTS: true,
    });
    this.send(message);
  }

  private send(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  setMessageHandler(handler: (message: GrokMessage) => void): void {
    this.onMessage = handler;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// For TTS synthesis with Grok
export async function synthesizeSpeech(
  text: string,
  language: string = 'en',
  voice: string = 'rex' // rex, ara (default Grok voices)
): Promise<ArrayBuffer> {
  // This would connect to Grok's TTS endpoint
  // Implementation depends on Grok API specifics
  const response = await fetch(`${GROK_API_URL}/tts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language,
      voice,
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS failed: ${response.statusText}`);
  }

  return response.arrayBuffer();
}

// For real-time translation
export async function translateAudio(
  audioData: ArrayBuffer,
  sourceLanguage: string,
  targetLanguage: string
): Promise<ArrayBuffer> {
  // Returns translated audio in target language
  const response = await fetch(`${GROK_API_URL}/translate/audio`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROK_API_KEY}`,
      'Content-Type': 'application/octet-stream',
    },
    body: audioData,
  });

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.statusText}`);
  }

  return response.arrayBuffer();
}
