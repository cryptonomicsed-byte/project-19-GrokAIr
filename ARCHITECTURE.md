# GrokAIr - Architecture & Design

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                            GrokAIr App                              │
│  (React Native + Expo)                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Learn Tab    │  │ Translate Tab│  │ Blitz Tab    │              │
│  │ (Lessons)    │  │ (P2P Voice)  │  │ (Speed Date) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Authentication         Storage            Real-time Features      │
│  (Firebase Auth)    (Zustand Stores)   (Grok, WebRTC, BLE)        │
├─────────────────────────────────────────────────────────────────────┤
│                         Backend Services                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Firebase Auth    │  │ Supabase DB      │  │ Grok Realtime    │ │
│  │ (Users, sessions)│  │ (Profiles, data) │  │ (AI, Translation)│ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐                        │
│  │ WebRTC STUN      │  │ ElevenLabs TTS   │                        │
│  │ (Audio streaming)│  │ (Premium voices) │                        │
│  └──────────────────┘  └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Authentication (`src/config/firebase.ts`)
- **Provider**: Firebase Auth
- **Methods**: Email/password, Google OAuth, Apple Sign In
- **Persistence**: AsyncStorage (mobile), LocalStorage (web)
- **State**: Zustand (`useAuthStore`)

### 2. Learn Tab (`src/screens/tabs/LearnScreen.tsx`)
- **Data Source**: Supabase `lessons` table
- **Progress Tracking**: `lesson_progress` table
- **Rewards**: XP, daily streaks, achievements
- **Voice**: Grok TTS (default) or ElevenLabs (Pro/Elite)
- **UI**: Card-based lessons, progress bars, lesson flow

### 3. Translate Tab (`src/screens/tabs/TranslateScreen.tsx`)
- **Connection Methods**:
  - QR code scanning (Expo Camera)
  - 6-digit code entry
  - Manual pairing
  - BLE for local discovery
  
- **Real-time Translation**:
  - User speaks → Grok transcribes + translates
  - WebRTC streams audio to peer
  - Peer hears translated audio
  
- **Session Management**:
  - Firebase stores session metadata
  - Supabase logs session history
  - Sessions support unlimited duration (Pro/Elite)

- **Audio Flow**:
  ```
  Recorder → Audio Buffer → Grok WebSocket → Translation
                                              ↓
                            WebRTC Peer → Audio Playback
  ```

### 4. Blitz Tab (`src/screens/tabs/BlitzScreen.tsx`)
- **Discovery**: BLE proximity scanning
- **Matching**: 2-minute timer, anonymous
- **Data**: No photos/names visible during chat
- **Extension**: Option to unlock (Pro/Elite) or share contact
- **BLE Beacon**: Periodic broadcast of language preference

### 5. State Management (Zustand)
```typescript
useAuthStore          // Current user, auth state
useUserStore          // User profile, preferences
```

### 6. API Clients

#### Grok Realtime (`src/utils/grokApi.ts`)
```typescript
GrokRealtimeClient {
  connect()           // Open WebSocket
  sendAudio()         // Send audio for translation
  sendText()          // Send text for TTS
  setMessageHandler() // Handle responses
  disconnect()
}
```

#### WebRTC (`src/utils/webrtcUtils.ts`)
```typescript
WebRTCPeer {
  addLocalStream()    // Add microphone
  signal()            // Handle SDP/ICE
  send()              // Send data
  cleanup()
}
```

#### BLE Discovery (`src/utils/bleDiscovery.ts`)
```typescript
BLEDiscovery {
  startDiscovery()    // Scan for beacons
  stopDiscovery()
  getDiscoveredUsers()
}
```

## Data Flow

### Learn Lesson Flow
1. User taps lesson card
2. Load lesson from Supabase
3. Play audio via Grok TTS
4. User progresses through steps
5. Mark complete, update `lesson_progress`
6. Award XP, update streak

### Translate Session Flow
1. Initiator enters code or scans QR
2. Initiator sends connection request to Supabase
3. Peer accepts (creates `translation_sessions` record)
4. Both connect to WebRTC (initiate + answer)
5. User speaks → Grok translates in real-time
6. Translated audio streams via WebRTC
7. On end → Save session, prompt for contact share

### Blitz Session Flow
1. Enable "Discover" → Start BLE scan
2. Display nearby users within 50m
3. Select user → Send pairing request
4. Both accept → Create `blitz_sessions` record
5. 2-minute timer starts
6. Live translation via Grok
7. Timer up → Prompt to extend or share contact
8. End session, return to discovery

## Database Schema (Supabase)

**Core Tables:**
- `users` → User profiles, streaks, XP, tier
- `lessons` → Lesson content, language, difficulty
- `lesson_progress` → User completion, scores
- `translation_sessions` → Peer-to-peer session logs
- `blitz_sessions` → Speed dating session logs
- `discovery_beacons` → Active BLE discovery beacons
- `subscriptions` → RevenueCat subscription tracking
- `user_preferences` → Voice settings, notifications

**Relationships:**
```
users
  ├─ lesson_progress (1 to many)
  ├─ translation_sessions (initiator, peer)
  ├─ blitz_sessions (user1, user2)
  ├─ discovery_beacons (1 to many)
  ├─ subscriptions (1 to many)
  └─ user_preferences (1 to 1)

lessons
  └─ lesson_progress (1 to many)
```

## Encryption & Privacy

### Transport Layer
- All API calls use HTTPS/WSS (TLS 1.3)
- Firebase Auth handles JWT tokens

### Application Layer
- Optional E2E encryption for audio (TweetNaCl.js)
- Session tokens expire after 30 minutes
- Discovery beacons auto-expire after 5 minutes

### Data Retention
- Chat recordings: 30 days (then purged)
- Session logs: 90 days (anonymized after)
- User data: Until account deletion

## Performance Optimizations

### Client-side
- Lesson data lazy-loaded
- BLE discovery limited to 50m radius
- Audio recorded in chunks, not whole file
- UI animations use React Native Reanimated

### Server-side
- Supabase indexes on frequently queried fields
- WebRTC STUN/TURN reduces latency
- Grok API batches requests

### Caching
- AsyncStorage for auth tokens
- In-memory cache for lessons
- No persistent cache of translations

## Subscription Tiers

### Free
- 5 lessons/day
- 1 Translate session/day (2 min)
- Basic Blitz (1 chat/day)
- Stock voices (Rex/Ara)

### Pro ($12/month)
- Unlimited Translate/Blitz
- ElevenLabs premium voices
- Offline lesson access
- Ad-free experience

### Elite ($20/month)
- Everything in Pro
- Voice cloning (upload voice sample)
- Priority matching in Blitz
- Custom lesson creation

Managed via RevenueCat SDK.

## Testing Strategy

### Unit Tests
- `grokApi.ts`: Mock WebSocket, test message parsing
- `audioUtils.ts`: Test buffer conversion, recording states
- `authStore.ts`: Test state updates

### Integration Tests
- Firebase Auth flow
- Supabase CRUD operations
- WebRTC peer connection

### E2E Tests (Detox)
- Login → Learn lesson → Complete
- Discover user → Blitz chat → Extend
- Translate session → Share contact

## Future Enhancements

1. **Offline Support**: IndexedDB cache for lessons
2. **Advanced AI**: Context-aware grammar feedback
3. **Social Features**: Friends list, leaderboards
4. **Gamification**: Badges, challenges, tournaments
5. **Group Learning**: 3+ person sessions
6. **AR Mode**: Live translation with camera overlay
7. **CLI Tool**: Command-line phrase book
8. **Wearable Support**: Watch companion for quick lessons

## Security Checklist

- [ ] Secrets in .env, not in repo
- [ ] API keys rotate every 90 days
- [ ] RLS policies enforce user isolation
- [ ] HTTPS/WSS for all external calls
- [ ] Input validation on all forms
- [ ] Rate limiting on API endpoints
- [ ] Session tokens expire in 30 min
- [ ] Audio purged after 30 days
- [ ] No sensitive data in logs

## Deployment Checklist

- [ ] All env vars configured
- [ ] Database schema created & indexed
- [ ] Firebase & Supabase projects set up
- [ ] Grok API quota verified
- [ ] RevenueCat configured
- [ ] App signing keys generated
- [ ] Privacy policy & ToS added
- [ ] TestFlight/Beta group invited
- [ ] Analytics integrated
- [ ] Error tracking (Sentry) enabled
