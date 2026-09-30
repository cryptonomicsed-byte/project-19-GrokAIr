# GrokAIr

A language-learning and AI-powered real-time translation mobile app built with React Native & Expo. Features three main modes: Learn (Duolingo-style lessons), Translate (peer-to-peer live voice translation), and Blitz (speed-dating language roulette).

## Features

- **Learn Tab**: Duolingo-inspired bite-sized lessons with Grok voice narration, daily streaks, XP, and adaptive content
- **Translate Tab**: Peer-to-peer live voice translation using Grok Realtime API (WebSocket) with WebRTC audio streaming
- **Blitz Tab**: 2-minute anonymous speed-dating sessions with BLE proximity discovery
- **Authentication**: Firebase Auth (email/Google/Apple)
- **Privacy-First**: End-to-end encryption, clear consent flows, no photos/names during chats
- **Subscriptions**: Free (basic), Pro ($12/month), Elite ($20/month) via RevenueCat
- **Multi-Language**: English, Spanish, French, Portuguese support (extensible)
- **Voice Synthesis**: Grok default voices (Rex/Ara) + ElevenLabs premium voices
- **Backend**: Supabase for user profiles, lesson progress, active beacons, streaks

## Project Structure

```
grokair/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   └── tabs/
│   │       ├── LearnScreen.tsx
│   │       ├── TranslateScreen.tsx
│   │       └── BlitzScreen.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Timer.tsx
│   │   └── index.ts
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── userStore.ts
│   ├── config/
│   │   ├── firebase.ts
│   │   └── supabase.ts
│   ├── utils/
│   │   ├── colors.ts
│   │   ├── grokApi.ts
│   │   ├── audioUtils.ts
│   │   ├── bleDiscovery.ts
│   │   └── webrtcUtils.ts
│   └── App.tsx
├── app.json (Expo config)
├── package.json
├── tsconfig.json
├── db-schema.sql (Supabase schema)
├── eas.json (EAS Build config)
└── README.md
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project
- A Supabase project
- Grok API credentials (xAI)
- ElevenLabs API key (optional, for premium voices)
- RevenueCat API credentials (for subscriptions)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd echo-companion
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

**Required credentials:**
- Firebase config (from Firebase Console)
- Supabase URL and Anon Key
- Grok API Key (from xAI)
- ElevenLabs API Key (optional)
- RevenueCat API keys

### 3. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema in `db-schema.sql` in your Supabase SQL Editor
3. Update `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

### 4. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password, Google, Apple)
3. Copy your Firebase config to `.env.local`

### 5. Run Locally

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web (limited features)
npm run web
```

The app will open in Expo Go on your device or simulator.

## Development Guide

### Adding a New Screen

1. Create screen file in `src/screens/tabs/`
2. Export from screen and add to navigator in `src/navigation/RootNavigator.tsx`
3. Add navigation tab if needed

### Adding a Lesson

Lessons are currently mock data in `LearnScreen.tsx`. To add real lessons:

1. Add to Supabase `lessons` table via SQL Editor
2. Query from `supabase.from('lessons').select()` in component

### Integrating Grok API

The `GrokRealtimeClient` in `src/utils/grokApi.ts` provides WebSocket connection. Usage:

```typescript
const grok = new GrokRealtimeClient();
await grok.connect();
grok.setMessageHandler((msg) => console.log(msg));
grok.sendAudio(audioBuffer, 'es'); // Send audio in Spanish
```

### Testing BLE Discovery

On Android, BLE works on device. Simulator requires configuration. For testing, `bleDiscovery.ts` returns mock data.

## API Integrations

### Grok Realtime API
- **Endpoint**: `wss://api.x.ai/grok/realtime`
- **Purpose**: Live speech transcription + translation
- **Auth**: Bearer token in header

### WebRTC
- Uses STUN servers for NAT traversal
- Fallback to cloud relay if needed
- Handles audio stream encoding/decoding

### Supabase
- Real-time subscriptions for lesson progress
- Authentication via JWT
- RLS policies for privacy

### RevenueCat
- Handles IAP validation (iOS/Android)
- Subscription status management
- No backend required

## Audio Handling

1. **Recording**: Expo's `expo-av` for microphone capture
2. **Playback**: Local audio playback with echo cancellation
3. **Streaming**: WebRTC for peer audio
4. **Translation**: Grok Realtime API (WebSocket)
5. **TTS**: Grok (free) or ElevenLabs (premium)

## Privacy & Security

- **Encryption**: End-to-end encryption for translation sessions (TLS + optional encryption at app level)
- **Consent**: Explicit permissions for microphone, Bluetooth, location
- **Data**: Minimal collection; sessions purged after 30 days
- **BLE**: Ephemeral discovery beacons, no persistent tracking

## Build & Deploy

### Expo Go (Quick Testing)
```bash
npm start
```
Scan QR code with Expo Go app.

### EAS Build (Production)
```bash
# First-time setup
npx eas-cli login

# Build for Android
npm run build:android

# Build for iOS
npm run build:ios

# Submit to stores
npx eas submit --platform android
npx eas submit --platform ios
```

### Manual Build
```bash
# Prebuild native code
npx expo prebuild --clean

# Build with Android Studio / Xcode
cd android && ./gradlew build  # Android
cd ios && xcodebuild -workspace ... # iOS
```

## Troubleshooting

### Microphone not working
- Check `app.json` permissions
- iOS: Add microphone description to `NSMicrophoneUsageDescription`
- Android: Request runtime permissions in code

### Grok API errors
- Verify API key in `.env.local`
- Check WebSocket connectivity
- Grok may have rate limits; add retry logic

### Supabase connection issues
- Verify URL and Anon Key
- Check network connectivity
- Ensure RLS policies allow your user

### BLE not discovering
- Android: Turn on Bluetooth, grant permissions
- iOS: Turn on Bluetooth, grant location permission (required for BLE scanning)
- Simulator: Use real devices for testing

## Next Steps

1. **Integrate Grok fully** with real audio streaming
2. **Add ElevenLabs TTS** for premium voices
3. **Implement RevenueCat subscriptions** for paywall
4. **Test with real users** on TestFlight / beta
5. **Analytics** via Mixpanel or Amplitude
6. **Push notifications** via Firebase Cloud Messaging

## License

MIT

## Support

For issues or questions, open a GitHub issue or contact hello@echocompanion.app
