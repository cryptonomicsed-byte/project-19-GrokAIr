import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Check .env.local');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;

// Type definitions for database
export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  language_learning: string; // e.g., "es", "fr", "de"
  native_language: string;
  xp_total: number;
  streak_days: number;
  tier: 'free' | 'pro' | 'elite';
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  content_json: Record<string, any>;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string | null;
  score: number;
  time_spent_seconds: number;
  created_at: string;
}

export interface TranslationSession {
  id: string;
  initiator_id: string;
  peer_id: string;
  initiator_language: string;
  peer_language: string;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  session_token: string;
  rtc_offer: string | null;
  rtc_answer: string | null;
  created_at: string;
}

export interface BlitzSession {
  id: string;
  user1_id: string;
  user2_id: string;
  language1: string;
  language2: string;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  contact_shared: boolean;
  created_at: string;
}

export interface DiscoveryBeacon {
  id: string;
  user_id: string;
  language: string;
  latitude: number;
  longitude: number;
  expires_at: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  revenucat_subscription_id: string;
  tier: 'free' | 'pro' | 'elite';
  started_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  voice_gender: 'male' | 'female' | 'neutral';
  voice_provider: 'grok' | 'elevenlabs';
  elevenlabs_voice_id: string | null;
  notification_enabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
}

export interface CryptoPayment {
  id: string;
  user_id: string;
  tier: 'pro' | 'elite';
  amount: string;
  currency: string; // e.g., "USDC", "ETH"
  chain: string; // e.g., "polygon", "ethereum", "solana"
  tx_hash: string;
  wallet_address: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  expires_at: string;
  confirmed_at: string | null;
  created_at: string;
}
