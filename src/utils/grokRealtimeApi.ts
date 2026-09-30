import { EventEmitter } from 'events';

export interface GrokMessage {
  type: 'text' | 'audio' | 'error' | 'connected' | 'disconnected';
  content?: string;
  language?: string;
  audioBuffer?: ArrayBuffer;
  error?: string;
  timestamp: number;
}

export interface GrokConfig {
  apiKey: string;
  model?: string; // Default: "grok-realtime-preview"
  sampleRate?: number; // Default: 16000
}

export class GrokRealtimeClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private model: string = 'grok-realtime-preview';
  private sampleRate: number = 16000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(config: GrokConfig) {
    super();
    this.apiKey = config.apiKey;
    this.model = config.model || 'grok-realtime-preview';
    this.sampleRate = config.sampleRate || 16000;
  }

  /**
   * Connect to Grok Realtime API
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = 'wss://api.x.ai/realtime';
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[Grok] Connected');
          this.reconnectAttempts = 0;
          this.sendMessage({
            type: 'session.init',
            config: {
              model: this.model,
              mode: 'realtime',
              language: 'auto-detect',
            },
          });
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[Grok] Error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Grok] Disconnected');
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('[Grok] Connection failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Send audio for transcription and translation
   */
  sendAudio(
    audioBuffer: ArrayBuffer | Uint8Array,
    sourceLanguage: string = 'en',
    targetLanguage: string = 'es'
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Grok] WebSocket not connected');
      return;
    }

    // Convert to base64 for transmission
    const base64Audio = this.arrayBufferToBase64(audioBuffer);

    this.sendMessage({
      type: 'audio.input',
      audio: base64Audio,
      config: {
        source_language: sourceLanguage,
        target_language: targetLanguage,
        encoding: 'pcm16',
        sample_rate: this.sampleRate,
      },
    });
  }

  /**
   * Send text for TTS (text-to-speech)
   */
  sendText(
    text: string,
    language: string = 'es',
    voice?: 'rex' | 'ara' | string
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Grok] WebSocket not connected');
      return;
    }

    this.sendMessage({
      type: 'text.input',
      text,
      config: {
        language,
        voice: voice || 'rex',
        speed: 1.0,
      },
    });
  }

  /**
   * Request translation of text
   */
  async requestTranslation(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const handler = (message: GrokMessage) => {
        if (
          message.type === 'text' &&
          message.language === targetLanguage &&
          message.content
        ) {
          this.removeListener('message', handler);
          resolve(message.content);
        } else if (message.type === 'error') {
          this.removeListener('message', handler);
          reject(new Error(message.error || 'Translation failed'));
        }
      };

      this.on('message', handler);

      // Set timeout
      setTimeout(() => {
        this.removeListener('message', handler);
        reject(new Error('Translation request timeout'));
      }, 30000);

      this.sendMessage({
        type: 'text.translate',
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      });
    });
  }

  /**
   * Disconnect from Grok
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // ---- Private Methods ----

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      if (message.type === 'transcription') {
        this.emit('message', {
          type: 'text',
          content: message.text,
          language: message.language,
          timestamp: Date.now(),
        } as GrokMessage);
      } else if (message.type === 'translation') {
        this.emit('message', {
          type: 'text',
          content: message.translated_text,
          language: message.target_language,
          timestamp: Date.now(),
        } as GrokMessage);
      } else if (message.type === 'audio.output') {
        const audioBuffer = this.base64ToArrayBuffer(message.audio);
        this.emit('message', {
          type: 'audio',
          audioBuffer,
          language: message.language,
          timestamp: Date.now(),
        } as GrokMessage);
      } else if (message.type === 'error') {
        this.emit('message', {
          type: 'error',
          error: message.error_message,
          timestamp: Date.now(),
        } as GrokMessage);
      }
    } catch (error) {
      console.error('[Grok] Failed to parse message:', error);
    }
  }

  private sendMessage(payload: Record<string, any>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Grok] Cannot send message, WebSocket not open');
      return;
    }

    try {
      this.ws.send(JSON.stringify(payload));
    } catch (error) {
      console.error('[Grok] Error sending message:', error);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`[Grok] Attempting reconnect in ${delay}ms...`);
      setTimeout(() => this.connect().catch(console.error), delay);
    } else {
      console.error('[Grok] Max reconnect attempts reached');
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Singleton instance
let grokInstance: GrokRealtimeClient | null = null;

export function getGrokClient(config?: GrokConfig): GrokRealtimeClient {
  if (!grokInstance && config) {
    grokInstance = new GrokRealtimeClient(config);
  }
  if (!grokInstance) {
    throw new Error('Grok client not initialized. Provide config.');
  }
  return grokInstance;
}

export function setGrokClient(client: GrokRealtimeClient): void {
  grokInstance = client;
}
