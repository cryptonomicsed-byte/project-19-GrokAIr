# GrokAIr - Development Notes

Live development log for tracking progress, decisions, and blockers.

## Current Status
- **Phase**: Scaffold Complete
- **Last Updated**: 2024
- **Version**: 0.1.0 (Pre-alpha)

## Completed Milestones ✅

### Project Setup
- [x] Initialized React Native + Expo project
- [x] Configured TypeScript
- [x] Set up project structure
- [x] Added Expo config (app.json, eas.json)

### Authentication & State
- [x] Firebase Auth integration
- [x] Zustand stores (authStore, userStore)
- [x] Login screen UI
- [x] Token persistence

### UI Components
- [x] Button component (3 variants)
- [x] Card component
- [x] Timer component (with countdown)
- [x] Bottom tab navigation

### Three Main Screens
- [x] Learn tab (lesson flow)
- [x] Translate tab (connection methods)
- [x] Blitz tab (discovery + chat)

### Backend Integration
- [x] Firebase config file
- [x] Supabase client setup
- [x] Database schema (SQL)
- [x] RLS policies template

### APIs & Utilities
- [x] Grok Realtime client
- [x] WebRTC peer setup
- [x] BLE discovery utilities
- [x] Audio recording/playback utilities

### Documentation
- [x] README.md (complete guide)
- [x] QUICKSTART.md (5-min setup)
- [x] ARCHITECTURE.md (system design)
- [x] SETUP_CHECKLIST.md (launch plan)
- [x] PROJECT_SUMMARY.md (overview)

## Next Steps 🔜

### Phase 1: Local Development
- [ ] Run `npm install`
- [ ] Create `.env.local` with test credentials
- [ ] Run `npm start`
- [ ] Test on Expo Go (Android)
- [ ] Test on Expo Go (iOS)
- [ ] Verify all screens load
- [ ] Test navigation between tabs

### Phase 2: Real Backend (Weeks 1-3)
- [ ] Create Firebase project
- [ ] Configure Firebase Auth
- [ ] Test email/password login
- [ ] Create Supabase project
- [ ] Run db-schema.sql
- [ ] Test Supabase connection
- [ ] Get Grok API key
- [ ] Test Grok WebSocket connection

### Phase 3: Feature Implementation (Weeks 2-4)
- [ ] Query real lessons from Supabase
- [ ] Implement lesson progress tracking
- [ ] Connect Grok TTS for lesson narration
- [ ] Implement Translate session creation
- [ ] Connect WebRTC for audio streaming
- [ ] Implement BLE discovery
- [ ] Add Blitz session matching

### Phase 4: Payments & Subscriptions (Week 4-5)
- [ ] Integrate RevenueCat SDK
- [ ] Create paywall UI
- [ ] Set up subscription tiers
- [ ] Implement feature gating
- [ ] Test purchases (sandbox)

### Phase 5: Testing & Refinement (Weeks 5-6)
- [ ] Unit tests (utils, stores)
- [ ] Integration tests (Firebase, Supabase)
- [ ] E2E tests (full flows)
- [ ] Android device testing
- [ ] iOS device testing
- [ ] Performance profiling
- [ ] Bug fixes

### Phase 6: Beta & Launch (Weeks 6-8)
- [ ] TestFlight upload
- [ ] Google Play Beta
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Submit for review
- [ ] App Store launch
- [ ] Google Play launch

## Key Decisions Made

### Architecture
- **State Management**: Zustand (lightweight, not Redux)
- **Navigation**: React Navigation (community standard)
- **Database**: Supabase (Firebase alternative, more control)
- **Real-time API**: Grok Realtime (WebSocket, low latency)
- **Audio**: Expo AV + WebRTC (native performance)

### Design
- **UI Inspiration**: Duolingo + Tinder (playful, engaging)
- **Color Palette**: Teal, orange, purple pastels
- **Animations**: React Native Reanimated (smooth)
- **Icons**: @expo/vector-icons (Ionicons)

### Subscriptions
- **Provider**: RevenueCat (backend-agnostic)
- **Tiers**: Free, Pro ($12/mo), Elite ($20/mo)
- **Features**: Lessons, Translate, Blitz, voices

## Known Limitations & Workarounds

### Current Mocks
| Feature | Current | Workaround | Real Implementation |
|---------|---------|------------|---------------------|
| Lessons | Sample data | Use mock lessons | Query Supabase |
| BLE discovery | Simulated users | Test with sample data | Implement BLE scan |
| Translation | Placeholder text | Show UI flow | Connect Grok API |
| WebRTC | Not connected | UI mockup | Set up peer connection |

### Platform Issues
- **Web**: Limited audio support (use mobile)
- **iOS**: Requires Bluetooth permissions for BLE
- **Android**: Requires Android 12+ for Bluetooth scanning
- **Simulator**: BLE doesn't work; use real devices

### Known Bugs / TODO
- [ ] Handle WebSocket reconnection
- [ ] Implement retry logic for failed Grok calls
- [ ] Add form validation on login
- [ ] Implement forgot password flow
- [ ] Handle network offline scenarios
- [ ] Add proper error screens
- [ ] Implement analytics tracking

## Dependencies & Versions

```json
{
  "expo": "^51.0.0",
  "react-native": "^0.74.0",
  "react": "^18.3.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.6.0",
  "@react-navigation/native-stack": "^6.11.0",
  "firebase": "^10.0.0",
  "@supabase/supabase-js": "^2.40.0",
  "zustand": "^4.4.0",
  "react-native-webrtc": "^111.0.0",
  "simple-peer": "^9.11.0",
  "@expo/vector-icons": "^14.0.0"
}
```

## Performance Metrics (Targets)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| App launch | < 2s | ? | 🔄 TBD |
| Lesson load | < 1s | ~ 0.3s (mock) | ✅ Good |
| Translation latency | < 500ms | ? | 🔄 TBD |
| Memory usage | < 150MB | ? | 🔄 TBD |
| Battery drain | < 5%/hr | ? | 🔄 TBD |

## Testing Strategy

### Unit Tests
- [ ] `colors.ts` - Verify color constants
- [ ] `grokApi.ts` - Mock WebSocket, test message parsing
- [ ] `audioUtils.ts` - Test buffer conversion
- [ ] `authStore.ts` - Test state updates
- [ ] `userStore.ts` - Test profile updates

### Integration Tests
- [ ] Firebase Auth login/signup
- [ ] Supabase user profile CRUD
- [ ] Lesson progress tracking
- [ ] Session creation/deletion

### E2E Tests (Detox)
- [ ] Login → Home → Tabs
- [ ] Learn: Open lesson → Complete
- [ ] Translate: Connect → Chat → Share
- [ ] Blitz: Discover → Match → Chat → Extend

### Device Testing
- [ ] Samsung Galaxy S21+ (Android 12)
- [ ] iPhone 13+ (iOS 16+)
- [ ] Test on WiFi + cellular
- [ ] Test with low battery mode
- [ ] Test with location off
- [ ] Test with Bluetooth off

## Security Checklist

- [x] API keys in .env, not in code
- [ ] Implement CSRF protection
- [ ] Hash user passwords (Firebase does this)
- [ ] Validate all user input
- [ ] Implement rate limiting
- [ ] Session tokens expire
- [ ] Audio purged after 30 days
- [ ] RLS policies on Supabase
- [ ] No sensitive data in logs
- [ ] Use HTTPS/WSS for all calls

## Documentation To-Do

- [x] README.md - Setup & features
- [x] QUICKSTART.md - 5-min setup
- [x] ARCHITECTURE.md - System design
- [x] SETUP_CHECKLIST.md - Launch phases
- [ ] API.md - API endpoint reference
- [ ] TROUBLESHOOTING.md - Common issues
- [ ] CONTRIBUTING.md - Dev guidelines
- [ ] CHANGELOG.md - Version history

## Team Communication

### Daily Standup (Suggested)
- What I shipped yesterday
- What I'm shipping today
- Blockers / help needed

### Weekly Sync
- Progress against milestones
- Design/feature decisions
- Budget/timeline review

### Slack Channels (if team)
- #echo-general - Updates
- #echo-bugs - Issues
- #echo-design - UI/UX
- #echo-deployment - Build/release

## Resources & Links

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev/docs
- **Firebase**: https://firebase.google.com/docs
- **Supabase**: https://supabase.com/docs
- **Grok API**: https://developer.x.ai/docs
- **React Navigation**: https://reactnavigation.org
- **Zustand**: https://github.com/pmndrs/zustand
- **WebRTC**: https://webrtc.org/

## Blockers & Issues

### Current Blockers
- None (scaffold complete)

### Potential Blockers
- Grok API rate limits (need to request quota)
- Firebase free tier limits (may need billing)
- Supabase free tier storage (20GB limit)
- iOS App Store review time (24-48 hours)

## Budget & Costs (Monthly)

| Service | Free Tier | Paid | Notes |
|---------|-----------|------|-------|
| Firebase | ✅ | $25+ | Auth, Realtime |
| Supabase | ✅ | $25+ | 500MB DB free |
| Grok API | 1M tokens/month | $5/1M tokens | Real-time translation |
| ElevenLabs | 10k chars/month | $5/50k chars | Premium voices |
| RevenueCat | ✅ | $0 | IAP management |
| Sentry | ✅ | $29+ | Error tracking |
| App Store | $99/year | (Apple) | iOS publishing |
| Google Play | $25 one-time | (Google) | Android publishing |

**Estimated monthly**: $50-150 (after launch)

## Launch Checklist

Before submitting to app stores:

- [ ] All major features working
- [ ] No console errors/warnings
- [ ] Privacy policy written
- [ ] Terms of service written
- [ ] Support email set up
- [ ] App icons created (1024x1024)
- [ ] Screenshots created (6 per language)
- [ ] App description written (100 chars)
- [ ] Keywords selected (5-10)
- [ ] Crash-free rate > 99%
- [ ] All permissions justified
- [ ] TestFlight feedback resolved
- [ ] Beta testers signed off

---

**Last Updated**: TBD
**Next Review**: Weekly
**Owner**: You
