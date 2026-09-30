# GrokAIr - Setup Checklist

Complete these steps to launch the app.

## Phase 1: Local Development (This Week)

- [x] Project structure created
- [x] React Native + Expo configured
- [x] Core screens (Learn, Translate, Blitz) scaffolded
- [x] Navigation (bottom tabs) implemented
- [x] Mock data for testing
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` file with test credentials
- [ ] Run `npm start` and test on Expo Go
- [ ] Test Login tab with Firebase
- [ ] Verify Learn tab loads and plays audio
- [ ] Verify Translate tab connection flow
- [ ] Verify Blitz tab discovery mock

## Phase 2: Backend & APIs (This Month)

### Firebase Setup
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Authentication (Email, Google, Apple)
- [ ] Configure app signing (Android & iOS)
- [ ] Add Firebase credentials to `.env.local`
- [ ] Test email/password signup
- [ ] Test Google OAuth
- [ ] Test Apple Sign In (iOS only)

### Supabase Setup
- [ ] Create Supabase project at supabase.com
- [ ] Run `db-schema.sql` in SQL Editor
- [ ] Verify tables created successfully
- [ ] Set up Row-Level Security (RLS) policies
- [ ] Enable Real-time subscriptions
- [ ] Add Supabase credentials to `.env.local`
- [ ] Test user profile CRUD
- [ ] Test lesson query

### Grok API Integration
- [ ] Get API key from https://developer.x.ai
- [ ] Test WebSocket connection (see `grokApi.ts`)
- [ ] Implement audio streaming to Grok
- [ ] Implement Grok transcription to translation
- [ ] Test TTS synthesis for default voices
- [ ] Add error handling & reconnection logic

### ElevenLabs Integration (Premium)
- [ ] Get API key from elevenlabs.io
- [ ] Implement voice list fetching
- [ ] Add voice cloning endpoint
- [ ] Test voice preview in app
- [ ] Connect to subscription tier

### WebRTC Setup
- [ ] Configure STUN servers
- [ ] Test P2P connection between two devices
- [ ] Verify audio streaming works
- [ ] Add fallback to cloud relay
- [ ] Implement ICE candidate handling

### BLE Discovery Setup (Android/iOS)
- [ ] Android: Request permissions in manifest
- [ ] iOS: Add Bluetooth descriptions to Info.plist
- [ ] Test BLE scanning on real devices
- [ ] Implement beacon advertising
- [ ] Add distance calculation from RSSI

## Phase 3: Subscriptions & Payments

### RevenueCat Setup
- [ ] Create RevenueCat account
- [ ] Configure iOS In-App Purchases
- [ ] Configure Android Play Billing
- [ ] Set up subscription products (Free, Pro, Elite)
- [ ] Add RevenueCat SDK to app
- [ ] Implement paywall UI
- [ ] Test subscription purchase flow
- [ ] Verify subscription status in app

## Phase 4: Testing & Refinement

### Functional Testing
- [ ] Full Learn lesson flow (start to complete)
- [ ] Full Translate session (connect to end)
- [ ] Full Blitz chat (discover to extend)
- [ ] Subscription upgrade/downgrade
- [ ] Session persistence on app close/open

### Device Testing
- [ ] Test on Android 12+ (minimum 2 devices)
- [ ] Test on iOS 13+ (minimum 2 devices)
- [ ] Test on cellular and WiFi
- [ ] Test with microphone permission denied
- [ ] Test with Bluetooth disabled

### Performance Testing
- [ ] Lesson loading time < 1 second
- [ ] Translation latency < 500ms
- [ ] Blitz discovery update < 2 seconds
- [ ] Memory usage < 150MB
- [ ] Battery drain < 5% per hour of use

### Security Testing
- [ ] Verify API keys not exposed in source
- [ ] Test Session token expiry
- [ ] Verify RLS policies enforce privacy
- [ ] Test data purge after 30 days

## Phase 5: Beta Release

### Prepare for TestFlight/Beta
- [ ] Create app icons (1024x1024)
- [ ] Create splash screen (2x)
- [ ] Write app description (100 chars)
- [ ] Write keywords (5-10)
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Add support email
- [ ] Create app preview screenshots (6)

### TestFlight (iOS)
- [ ] Build with EAS: `npm run build:ios`
- [ ] Upload to TestFlight
- [ ] Invite testers
- [ ] Collect feedback (bugs, UX)
- [ ] Fix critical bugs
- [ ] Submit for App Review

### Google Play Beta
- [ ] Build with EAS: `npm run build:android`
- [ ] Upload to Google Play Console
- [ ] Set as beta track
- [ ] Invite beta testers
- [ ] Collect feedback
- [ ] Fix critical bugs

## Phase 6: Production Launch

### Pre-launch Checklist
- [ ] All bugs from beta fixed
- [ ] Performance optimized
- [ ] Analytics integrated
- [ ] Error tracking (Sentry) enabled
- [ ] Support system set up
- [ ] Marketing materials ready

### App Store Launch
- [ ] Create Apple Developer account
- [ ] Create Google Play Developer account
- [ ] Configure app signing
- [ ] Submit for review (typically 24-48 hours)
- [ ] Set launch date
- [ ] Prepare launch announcement

### Post-launch
- [ ] Monitor crash reports
- [ ] Monitor user feedback
- [ ] Plan v1.1 roadmap
- [ ] Schedule regular updates (monthly)

## Critical Dependencies

```json
{
  "expo": "^51.0.0",
  "react-native": "^0.74.0",
  "react-native-webrtc": "^111.0.0",
  "firebase": "^10.0.0",
  "supabase-js": "^2.40.0",
  "zustand": "^4.4.0",
  "elevenlabs": "^0.2.x"
}
```

Update `package.json` if using different versions.

## Timeline Estimate

- **Phase 1** (Local Dev): 3-5 days
- **Phase 2** (APIs): 2-3 weeks
- **Phase 3** (Subscriptions): 1 week
- **Phase 4** (Testing): 1-2 weeks
- **Phase 5** (Beta): 2 weeks (reviewers)
- **Phase 6** (Launch): 1 week

**Total**: ~2 months to production

## Support Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **Firebase Docs**: https://firebase.google.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Grok API**: https://developer.x.ai/docs
- **WebRTC**: https://webrtc.org/

## Slack Channels (if using team workspace)
- #echo-bugs
- #echo-features
- #echo-design
- #echo-deployment

Mark items complete as you go. Keep this updated!
