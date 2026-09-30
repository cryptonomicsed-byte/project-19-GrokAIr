import { create } from 'zustand';
import supabase, { TranslationSession } from '../config/supabase';
import { GrokRealtimeClient } from '../utils/grokRealtimeApi';
import { WebRTCPeer } from '../utils/webrtcUtils';

interface TranslationState {
  // Session state
  activeSessionId: string | null;
  sessions: TranslationSession[];
  currentSession: TranslationSession | null;

  // Connection state
  grokClient: GrokRealtimeClient | null;
  rtcPeer: WebRTCPeer | null;
  isConnected: boolean;

  // UI state
  isTranscribing: boolean;
  transcript: string;
  translation: string;
  targetLanguage: string;

  // Actions
  createSession: (initiatorId: string, peerId: string) => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  endSession: () => Promise<void>;
  startTranscription: (language: string) => Promise<void>;
  stopTranscription: () => Promise<void>;
  setSessions: (sessions: TranslationSession[]) => void;
  setTranscript: (text: string) => void;
  setTranslation: (text: string) => void;
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  // Initial state
  activeSessionId: null,
  sessions: [],
  currentSession: null,
  grokClient: null,
  rtcPeer: null,
  isConnected: false,
  isTranscribing: false,
  transcript: '',
  translation: '',
  targetLanguage: 'es',

  // Create new translation session
  createSession: async (initiatorId: string, peerId: string) => {
    try {
      const { data, error } = await supabase
        .from('translation_sessions')
        .insert({
          initiator_id: initiatorId,
          peer_id: peerId,
          initiator_language: 'en',
          peer_language: 'es',
          duration_seconds: 0,
          started_at: new Date().toISOString(),
          session_token: generateSessionToken(),
        })
        .select()
        .single();

      if (error) throw error;

      set({
        activeSessionId: data.id,
        currentSession: data,
      });
    } catch (error) {
      console.error('[Translation] Failed to create session:', error);
    }
  },

  // Join existing session
  joinSession: async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('translation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      set({
        activeSessionId: sessionId,
        currentSession: data,
      });
    } catch (error) {
      console.error('[Translation] Failed to join session:', error);
    }
  },

  // End session
  endSession: async () => {
    const { activeSessionId } = get();

    if (!activeSessionId) return;

    try {
      const { error } = await supabase
        .from('translation_sessions')
        .update({
          ended_at: new Date().toISOString(),
        })
        .eq('id', activeSessionId);

      if (error) throw error;

      set({
        activeSessionId: null,
        currentSession: null,
        isTranscribing: false,
        transcript: '',
        translation: '',
      });
    } catch (error) {
      console.error('[Translation] Failed to end session:', error);
    }
  },

  // Start transcription with Grok
  startTranscription: async (language: string) => {
    try {
      set({ isTranscribing: true, targetLanguage: language });
      // Grok client will be initialized by component
    } catch (error) {
      console.error('[Translation] Failed to start transcription:', error);
      set({ isTranscribing: false });
    }
  },

  // Stop transcription
  stopTranscription: async () => {
    set({ isTranscribing: false });
  },

  // Utility setters
  setSessions: (sessions) => set({ sessions }),
  setTranscript: (transcript) => set({ transcript }),
  setTranslation: (translation) => set({ translation }),
}));

// Helper function
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
