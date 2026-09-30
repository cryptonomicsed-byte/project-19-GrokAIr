# Implementation Guide: Supabase, Grok, WebRTC, BLE, and Crypto Payments

This guide covers the full implementation of all backend services for GrokAIr.

## 1. Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Note your **Project URL** and **Anon Key**
4. Add to `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyxxxxx
```

### 1.2 Run Database Schema

Copy the SQL below into Supabase SQL Editor and execute:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  language_learning TEXT DEFAULT 'es',
  native_language TEXT DEFAULT 'en',
  xp_total INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  subscription_id UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  content_json JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Lesson progress
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP,
  score INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Translation sessions
CREATE TABLE translation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  peer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  initiator_language TEXT DEFAULT 'en',
  peer_language TEXT DEFAULT 'es',
  duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  session_token TEXT UNIQUE NOT NULL,
  rtc_offer TEXT,
  rtc_answer TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Blitz sessions
CREATE TABLE blitz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language1 TEXT NOT NULL,
  language2 TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  contact_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Discovery beacons (BLE)
CREATE TABLE discovery_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revenucat_subscription_id TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'elite')),
  started_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Crypto payments
CREATE TABLE crypto_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'elite')),
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  chain TEXT NOT NULL,
  tx_hash TEXT,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')),
  expires_at TIMESTAMP NOT NULL,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  voice_gender TEXT DEFAULT 'male',
  voice_provider TEXT DEFAULT 'grok',
  elevenlabs_voice_id TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'auto',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_translation_sessions_initiator ON translation_sessions(initiator_id);
CREATE INDEX idx_translation_sessions_peer ON translation_sessions(peer_id);
CREATE INDEX idx_blitz_sessions_user1 ON blitz_sessions(user1_id);
CREATE INDEX idx_blitz_sessions_user2 ON blitz_sessions(user2_id);
CREATE INDEX idx_discovery_beacons_user ON discovery_beacons(user_id);
CREATE INDEX idx_discovery_beacons_expires ON discovery_beacons(expires_at);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(user_id, is_active);
CREATE INDEX idx_crypto_payments_user ON crypto_payments(user_id);
CREATE INDEX idx_crypto_payments_status ON crypto_payments(status);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blitz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view all public profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own lesson progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view all lesson progress" ON lesson_progress
  FOR SELECT USING (true);

CREATE POLICY "Users can create lesson progress" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON translation_sessions
  FOR SELECT USING (auth.uid() = initiator_id OR auth.uid() = peer_id);

CREATE POLICY "Users can view own crypto payments" ON crypto_payments
  FOR SELECT USING (auth.uid() = user_id);
```

### 1.3 Enable Realtime (Optional but Recommended)

In Supabase dashboard:
1. Go to Database → Realtime
2. Enable realtime for `translation_sessions`, `blitz_sessions`, `discovery_beacons`

## 2. Grok API Setup

### 2.1 Get API Key

1. Go to https://developer.x.ai
2. Create account and get API key
3. Add to `.env.local`:

```env
EXPO_PUBLIC_GROK_API_KEY=xai-xxxxxxxxxxxxxxxxxx
```

### 2.2 Initialize Grok Client

In your component:

```typescript
import { GrokRealtimeClient } from '../utils/grokRealtimeApi';

const grok = new GrokRealtimeClient({
  apiKey: process.env.EXPO_PUBLIC_GROK_API_KEY!,
});

await grok.connect();

// Listen for messages
grok.on('message', (message) => {
  if (message.type === 'text') {
    console.log('Translation:', message.content);
  }
});

// Send audio
grok.sendAudio(audioBuffer, 'en', 'es'); // English → Spanish

// Request translation
const translated = await grok.requestTranslation(
  'Hello, how are you?',
  'en',
  'es'
);
```

## 3. WebRTC Setup

### 3.1 Configure STUN/TURN Servers

The implementation includes default Google STUN servers. For production, use:

```typescript
import { WebRTCPeer } from '../utils/webrtcUtils';

const peer = new WebRTCPeer({
  initiator: true,
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:numb.viagenie.ca',
      username: 'webrtc@example.com',
      credential: 'webrtcpassword'
    }
  ]
});

await peer.initialize();

peer.on('signal', (data) => {
  // Send SDP offer/answer to peer via signaling server
  sendToSignalingServer(data);
});

peer.on('stream', (stream) => {
  // Handle remote audio stream
  playRemoteStream(stream);
});
```

### 3.2 Signaling Flow

1. **Initiator** creates offer and sends via Supabase
2. **Peer** receives, creates answer, sends back
3. Both exchange ICE candidates
4. Connection established

```typescript
// In Translate screen
const initiateCall = async (peerId: string) => {
  const peer = new WebRTCPeer({ initiator: true });
  await peer.initialize();

  peer.on('signal', async (sdp) => {
    // Store in Supabase
    await supabase
      .from('translation_sessions')
      .update({ rtc_offer: JSON.stringify(sdp) })
      .eq('id', sessionId);
  });

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  await peer.addLocalStream(stream);
};
```

## 4. BLE (Bluetooth Low Energy) Setup

### 4.1 iOS Configuration

In `app.json`:

```json
{
  "expo": {
    "plugins": [
      "expo-web-ble",
      [
        "expo-permissions",
        {
          "bluetoothPeripheral": "Allow $(PRODUCT_NAME) to connect to Bluetooth devices"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSBluetoothPeripheralUsageDescription": "We use Bluetooth to discover nearby language partners",
        "NSBluetoothAlwaysAndWhenInUseUsageDescription": "We use Bluetooth for language exchange"
      }
    }
  }
}
```

### 4.2 Android Configuration

In `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

### 4.3 Start Discovery

```typescript
import { BLEDiscovery, BLEBeacon } from '../utils/bleDiscovery';

const discovery = new BLEDiscovery();

discovery.on('device:found', (device) => {
  console.log('Found:', device.name, device.language);
});

await discovery.startDiscovery(30000); // 30 seconds

const users = discovery.getDiscoveredUsers(50); // Within 50 meters

// Advertise your beacon
const beacon = new BLEBeacon(userId, 'es'); // Spanish speaker
await beacon.startAdvertising();
```

## 5. Crypto Payment Setup

### 5.1 Supported Chains & Currencies

- **Ethereum**: USDC, ETH
- **Polygon**: USDC, MATIC
- **Solana**: USDC, SOL

### 5.2 Configure RPC Endpoints

Add to `.env.local`:

```env
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### 5.3 Create Payment in App

```typescript
import { usePaymentStore } from '../stores/paymentStore';

const { initiateCryptoPayment } = usePaymentStore();

// Show payment options
const handlePayment = async () => {
  const paymentId = await initiateCryptoPayment(
    userId,
    'pro', // tier
    'USDC', // currency
    'polygon', // chain
    walletAddress // user's wallet
  );

  // User signs transaction with wallet
  // Verify when transaction is confirmed
  const success = await verifyCryptoPayment(paymentId, txHash);
};
```

### 5.4 Payment Flow

1. User selects tier and crypto currency
2. Create payment session in DB (5-15 min expiry)
3. Display wallet address + amount
4. User signs and sends transaction
5. App listens for on-chain confirmation
6. Grant subscription when confirmed

## 6. Integration Example: Complete Translate Flow

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { GrokRealtimeClient } from '../utils/grokRealtimeApi';
import { WebRTCManager } from '../utils/webrtcUtils';
import supabase from '../config/supabase';

export default function TranslateScreen() {
  const user = useAuthStore((s) => s.user);
  const { createSession, endSession, transcript, translation } =
    useTranslationStore();

  const [grok, setGrok] = useState<GrokRealtimeClient | null>(null);
  const rtcManager = WebRTCManager.getInstance();

  useEffect(() => {
    // Initialize Grok
    const initGrok = async () => {
      const client = new GrokRealtimeClient({
        apiKey: process.env.EXPO_PUBLIC_GROK_API_KEY!,
      });
      await client.connect();
      setGrok(client);

      client.on('message', (msg) => {
        if (msg.type === 'text') {
          useTranslationStore.setState({ translation: msg.content });
        }
      });
    };

    initGrok();

    return () => {
      grok?.disconnect();
    };
  }, []);

  const handleStartSession = async (peerId: string) => {
    // Create session in DB
    await createSession(user!.id, peerId);

    // Create WebRTC peer
    const peer = await rtcManager.createPeer(peerId, { initiator: true });

    peer.on('signal', async (sdp) => {
      // Send offer to Supabase
      const sessions = useTranslationStore((s) => s.sessions);
      if (sessions.length > 0) {
        await supabase
          .from('translation_sessions')
          .update({ rtc_offer: JSON.stringify(sdp) })
          .eq('id', sessions[0].id);
      }
    });

    peer.on('stream', (stream) => {
      // Play remote audio
      console.log('Received audio stream');
    });

    // Get local audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    await peer.addLocalStream(stream);
  };

  const handleSendAudio = (audioBuffer: ArrayBuffer) => {
    grok?.sendAudio(audioBuffer, 'en', 'es');
  };

  const handleEndSession = async () => {
    rtcManager.closeAll();
    await endSession();
  };

  return (
    <View>
      <Text>Transcript: {transcript}</Text>
      <Text>Translation: {translation}</Text>
      <TouchableOpacity onPress={() => handleStartSession('peer_id')}>
        <Text>Start Translation</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleEndSession}>
        <Text>End Session</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 7. Environment Setup

### .env.local Template

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyxxxxx

# Grok API
EXPO_PUBLIC_GROK_API_KEY=xai-xxxxxxxxx

# RPC Endpoints
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/xxxxx
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/xxxxx
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/xxxxx

# Payment Services (Optional)
REVENUCAT_API_KEY=xxxxx
STRIPE_API_KEY=sk_xxxxx
```

## 8. Testing Checklist

- [ ] Supabase database created and RLS enabled
- [ ] Grok API connected and returning translations
- [ ] WebRTC peer connections establishing
- [ ] BLE discovery finding nearby devices
- [ ] Crypto payments creating payment sessions
- [ ] Crypto payments verifying on-chain transactions
- [ ] Subscription grants working after payment
- [ ] All stores initializing properly

## 9. Production Deployment

1. **Security**
   - Rotate API keys
   - Enable HTTPS/WSS everywhere
   - Set RLS policies correctly
   - Remove test data from DB

2. **Performance**
   - Index all frequently queried fields
   - Set up Supabase backup
   - Monitor Grok API quotas
   - Load test WebRTC under peak load

3. **Monitoring**
   - Add Sentry for error tracking
   - Monitor Grok API latency
   - Track payment success rates
   - Monitor BLE discovery radius

4. **Testing**
   - Beta test on 100 users
   - Collect feedback on crypto payments
   - Test various BLE devices
   - Verify translation quality

---

**Total implementation time: 2-3 weeks** depending on prior experience
