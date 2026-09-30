-- Echo Companion Database Schema (Supabase/PostgreSQL)

-- Users Profile
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  profile_photo_url TEXT,
  native_language VARCHAR(5) NOT NULL DEFAULT 'en',
  target_language VARCHAR(5) NOT NULL DEFAULT 'es',
  premium_tier VARCHAR(20) NOT NULL DEFAULT 'free',
  streak_days INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  last_streak_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT true,
  voice_tone VARCHAR(50) DEFAULT 'rex',
  sound_effects_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  language VARCHAR(5) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  duration_minutes INTEGER,
  xp_reward INTEGER DEFAULT 10,
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  score DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Active Discovery Beacons (for BLE Blitz)
CREATE TABLE IF NOT EXISTS discovery_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_language VARCHAR(5) NOT NULL,
  native_language VARCHAR(5) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  signal_strength INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Translation Sessions
CREATE TABLE IF NOT EXISTS translation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  peer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_code VARCHAR(20) UNIQUE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  initiator_language VARCHAR(5),
  peer_language VARCHAR(5),
  recording_url TEXT,
  is_extended BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blitz Chat Sessions
CREATE TABLE IF NOT EXISTS blitz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INTEGER DEFAULT 120,
  user1_language VARCHAR(5),
  user2_language VARCHAR(5),
  was_extended BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Records
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL,
  revenuecat_subscription_id TEXT,
  purchase_date TIMESTAMP DEFAULT NOW(),
  renewal_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  cancellation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact Shares (WhatsApp/social sharing)
CREATE TABLE IF NOT EXISTS contact_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) NOT NULL,
  contact_value TEXT NOT NULL,
  shared_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback/Reports
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50) NOT NULL,
  content TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_premium_tier ON users(premium_tier);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_discovery_beacons_user ON discovery_beacons(user_id);
CREATE INDEX idx_discovery_beacons_expires ON discovery_beacons(expires_at);
CREATE INDEX idx_translation_sessions_users ON translation_sessions(initiator_id, peer_id);
CREATE INDEX idx_blitz_sessions_users ON blitz_sessions(user1_id, user2_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);

-- RLS Policies (if using Supabase Auth)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blitz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY users_view_self ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY users_update_self ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can view their own lesson progress
CREATE POLICY lesson_progress_view_self ON lesson_progress
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own preferences
CREATE POLICY preferences_view_self ON user_preferences
  FOR SELECT USING (auth.uid()::text = user_id::text);
