# Quick Start for Developers

Get the entire system running in 30 minutes.

## Step 1: Clone & Install (2 min)

```bash
cd echo-companion
npm install
cp .env.example .env.local
```

## Step 2: Get API Keys (5 min)

### Supabase
1. Go to https://supabase.com/dashboard
2. Create new project (choose region closest to you)
3. Copy **Project URL** and **Anon Key**
4. Add to `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Grok
1. Go to https://developer.x.ai
2. Sign up and create API key
3. Add to `.env.local`:
```env
EXPO_PUBLIC_GROK_API_KEY=xai-xxxxxxx
```

### RPC Endpoints (for crypto payments)
Get free endpoints from Alchemy:
1. https://www.alchemy.com
2. Create account
3. Create apps for Ethereum, Polygon, Solana
4. Add to `.env.local`:
```env
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/xxxxx
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/xxxxx
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/xxxxx
```

## Step 3: Setup Supabase Database (3 min)

1. In Supabase dashboard, go to **SQL Editor**
2. Create new query
3. Copy this SQL and run it:

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

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_translation_sessions_initiator ON translation_sessions(initiator_id);
CREATE INDEX idx_translation_sessions_peer ON translation_sessions(peer_id);
CREATE INDEX idx_blitz_sessions_user1 ON blitz_sessions(user1_id);
CREATE INDEX idx_blitz_sessions_user2 ON blitz_sessions(user2_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_crypto_payments_user ON crypto_payments(user_id);
```

## Step 4: Start Dev Server (2 min)

```bash
npm start
```

You should see:
```
> Local:   http://localhost:8081
> Scan the QR code below with Expo Go (Android) or the Camera app (iOS) to open your app
┌─────────────────────────────────────────┐
│ Expo QR Code                            │
└─────────────────────────────────────────┘
```

## Step 5: Open in Expo Go (1 min)

**iOS:**
- Open Camera app
- Scan QR code
- Tap notification

**Android:**
- Open Expo Go app
- Tap scan
- Scan QR code

App should load in ~30 seconds.

## Testing Each Feature

### Test Grok Translation

```typescript
// In TranslateScreen component
import { GrokRealtimeClient } from '../utils/grokRealtimeApi';

const grok = new GrokRealtimeClient({
  apiKey: process.env.EXPO_PUBLIC_GROK_API_KEY!,
});

await grok.connect();

// Test text translation
const result = await grok.requestTranslation(
  'Hello, how are you?',
  'en',
  'es'
);
console.log(result); // Should print Spanish translation
```

### Test WebRTC

```typescript
// In any component
import { WebRTCPeer } from '../utils/webrtcUtils';

const peer = new WebRTCPeer({ initiator: true });
await peer.initialize();

peer.on('signal', (data) => {
  console.log('Offer:', data.sdp);
});

peer.on('connected', () => {
  console.log('WebRTC connected!');
});
```

### Test BLE Discovery

```typescript
// In BlitzScreen
import { BLEDiscovery } from '../utils/bleDiscovery';

const discovery = new BLEDiscovery();

discovery.on('device:found', (device) => {
  console.log('Found device:', device.name, device.language);
});

await discovery.startDiscovery(30000);

setTimeout(() => {
  const users = discovery.getDiscoveredUsers(50);
  console.log('Users nearby:', users);
}, 5000);
```

### Test Crypto Payments

1. Navigate to Crypto Payment screen
2. Select "Pro" or "Elite"
3. Choose "USDC on Polygon" (cheapest)
4. Enter any wallet address
5. Submit
6. Test transaction hash verification

For testing without real transaction:
```typescript
// Use testnet instead of mainnet
// - Ethereum Sepolia
// - Polygon Mumbai
// - Solana Devnet
```

## Common Issues & Fixes

### "Supabase URL not set"
Check `.env.local` has `EXPO_PUBLIC_SUPABASE_URL`

### "WebSocket connection failed"
- Check `EXPO_PUBLIC_GROK_API_KEY` is correct
- Check network connectivity
- Try restarting dev server

### "Permission denied" (BLE)
- Add permissions in `app.json` (already done)
- Request permissions at runtime
- Test on real device (not simulator)

### "React/Zustand import error"
```bash
npm install react zustand events
npm start -- --reset-cache
```

### Hot reload not working
Press `r` in terminal to reload, or:
```bash
npm start -- --reset-cache
```

## File Structure for Reference

```
echo-companion/
├── src/
│   ├── config/
│   │   ├── firebase.ts
│   │   └── supabase.ts ← Database config
│   ├── utils/
│   │   ├── grokRealtimeApi.ts ← Translation
│   │   ├── webrtcUtils.ts ← Peer audio
│   │   ├── bleDiscovery.ts ← BLE scanning
│   │   └── audioUtils.ts
│   ├── services/
│   │   └── paymentService.ts ← Crypto payments
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── translationStore.ts
│   │   └── paymentStore.ts
│   └── screens/
│       ├── tabs/
│       │   ├── LearnScreen.tsx
│       │   ├── TranslateScreen.tsx
│       │   ├── BlitzScreen.tsx
│       │   └── CryptoPaymentScreen.tsx
│       └── auth/
│           └── LoginScreen.tsx
├── IMPLEMENTATION_GUIDE.md ← Full docs
├── INTEGRATION_SUMMARY.md ← Feature overview
└── QUICK_START_DEV.md ← This file
```

## Next Steps

1. **Week 1:** Get all 3 services connected
   - [ ] Supabase CRUD working
   - [ ] Grok translation working
   - [ ] WebRTC peers connecting

2. **Week 2:** Complete feature integration
   - [ ] Translation screen fully functional
   - [ ] BLE discovery working
   - [ ] Crypto payments verified

3. **Week 3:** Polish & testing
   - [ ] All features tested on real devices
   - [ ] Error handling complete
   - [ ] Performance optimized

4. **Week 4:** Beta & launch
   - [ ] TestFlight/Play Beta
   - [ ] App Store submission
   - [ ] Go live 🚀

## Helpful Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for Android
npm run build:android

# Build for iOS
npm run build:ios

# Clean cache
npm start -- --reset-cache

# Debug in dev tools
expo-dev-client
```

## Support

- **Expo Docs:** https://docs.expo.dev
- **Supabase Docs:** https://supabase.com/docs
- **Grok Docs:** https://developer.x.ai/docs
- **WebRTC MDN:** https://developer.mozilla.org/docs/Web/API/WebRTC_API

---

**You're now ready to build the app! Happy coding 🚀**
