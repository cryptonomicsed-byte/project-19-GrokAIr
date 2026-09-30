# GrokAIr - Quick Reference Card

Keep this handy while developing.

## Getting Started (5 Minutes)

```bash
# 1. Install
cd grokair
npm install

# 2. Configure
cp .env.example .env.local
# Add credentials to .env.local

# 3. Run
npm start

# 4. Test
# Android: npm run android
# iOS: npm run ios
# Web: npm run web
```

## File Locations

| What | Where |
|------|-------|
| Screens | `src/screens/` |
| Components | `src/components/` |
| State stores | `src/stores/` |
| API clients | `src/utils/` or `src/config/` |
| Navigation | `src/navigation/` |
| Colors | `src/utils/colors.ts` |
| Config | `app.json`, `.env.local` |

## Common Tasks

### Add a new lesson
```typescript
// In LearnScreen.tsx, add to mock data:
{
  id: '3',
  title: 'Past Tense',
  description: 'Learn how to conjugate past tense verbs',
  language: 'es',
  difficulty: 'intermediate',
  duration: 10,
  completed: false,
  xpReward: 20,
}
```

### Change colors
```typescript
// Edit src/utils/colors.ts
export const colors = {
  primary: '#1F9D7F',    // Change here
  secondary: '#FF6B35',  // Or here
  // ...
}
```

### Add a new tab
```typescript
// In src/navigation/RootNavigator.tsx
<Tab.Screen
  name="NewTab"
  component={NewTabStack}
  options={{
    title: 'NewTab',
    tabBarIcon: ({ focused, color }) => (
      <Ionicons name="icon-name" size={24} color={color} />
    ),
  }}
/>
```

### Connect to Firebase Auth
```typescript
// Already set up! Just use:
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword } from '@firebase/auth';

const result = await signInWithEmailAndPassword(auth, email, password);
useAuthStore((state) => state.setUser(result.user));
```

### Connect to Supabase
```typescript
// Already set up! Just use:
import { supabase } from '@/config/supabase';

const { data, error } = await supabase
  .from('lessons')
  .select()
  .eq('language', 'es');
```

### Use Grok API
```typescript
// In any component:
import { GrokRealtimeClient } from '@/utils/grokApi';

const grok = new GrokRealtimeClient();
await grok.connect();
grok.sendAudio(audioBuffer, 'es');
grok.setMessageHandler((msg) => console.log(msg));
```

## Component Props

### Button
```typescript
<Button
  title="Click me"
  onPress={() => {}}
  variant="primary"        // primary, secondary, outline
  size="medium"            // small, medium, large
  disabled={false}
/>
```

### Card
```typescript
<Card style={{ marginBottom: 12 }}>
  <Text>Content here</Text>
</Card>
```

### Timer
```typescript
<Timer
  initialSeconds={120}
  onTimeUp={() => alert('Time up!')}
  isRunning={true}
  size="large"             // small, large
/>
```

## State Management (Zustand)

### Auth Store
```typescript
import { useAuthStore } from '@/stores/authStore';

const user = useAuthStore((state) => state.user);
const setUser = useAuthStore((state) => state.setUser);
const error = useAuthStore((state) => state.error);
```

### User Store
```typescript
import { useUserStore } from '@/stores/userStore';

const profile = useUserStore((state) => state.profile);
const setProfile = useUserStore((state) => state.setProfile);
const updateProfile = useUserStore((state) => state.updateProfile);
```

## API Reference

### GrokRealtimeClient
```typescript
const grok = new GrokRealtimeClient();

// Connect
await grok.connect();

// Send audio
grok.sendAudio(audioBuffer, 'es');

// Send text
grok.sendText('Hello', 'es');

// Handle responses
grok.setMessageHandler((msg) => {
  if (msg.type === 'text') console.log(msg.content);
});

// Disconnect
grok.disconnect();
```

### AudioRecorder
```typescript
import { AudioRecorder } from '@/utils/audioUtils';

const recorder = new AudioRecorder();
await recorder.startRecording();
const uri = await recorder.stopRecording();
await recorder.playAudio(uri);
await recorder.stopPlayback();
```

### WebRTCPeer
```typescript
import { WebRTCPeer } from '@/utils/webrtcUtils';

const peer = new WebRTCPeer(initiator);
await peer.addLocalStream(stream);
peer.addSignalHandler((data) => {});
peer.addStreamHandler((stream) => {});
peer.signal(data);
peer.send(data);
peer.cleanup();
```

### BLEDiscovery
```typescript
import { bleDiscovery } from '@/utils/bleDiscovery';

await bleDiscovery.startDiscovery();
const users = bleDiscovery.getDiscoveredUsers();
bleDiscovery.stopDiscovery();
```

## Environment Variables

```env
# Required
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxx
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
GROK_API_KEY=xxx

# Optional
ELEVENLABS_API_KEY=xxx
REVENUECAT_API_KEY=xxx
```

## Debugging

### View logs
```bash
# In terminal where npm start is running
# Press 'd' for Android, 'i' for iOS debugger

# Or use React Native Debugger
npx react-native-debugger
```

### Inspect state
```typescript
// In any component
import { useAuthStore } from '@/stores/authStore';

// Subscribe to store changes
useEffect(() => {
  const unsubscribe = useAuthStore.subscribe((state) => {
    console.log('Auth state:', state);
  });
  return unsubscribe;
}, []);
```

### Network inspection
Use DevTools in browser:
```bash
npm run web
# Opens http://localhost:19006
# Use Chrome DevTools (F12) to inspect network
```

## Performance Tips

1. **Lazy load images**
```typescript
import { Image } from 'react-native';
Image.prefetch(url);
```

2. **Memoize components**
```typescript
import React from 'react';
const MyComponent = React.memo(({ prop }) => (...));
```

3. **Use FlatList for long lists**
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <Item />}
  keyExtractor={(item) => item.id}
/>
```

4. **Optimize re-renders**
```typescript
const value = useMemo(() => expensiveCalc(), [deps]);
const callback = useCallback(() => {}, [deps]);
```

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Cannot find module '@/'` | Check `tsconfig.json` paths |
| `Firebase: No project configured` | Add `.env.local` with credentials |
| `Supabase connection failed` | Check URL and Anon Key |
| `Microphone permission denied` | Request permission in code |
| `WebSocket connection failed` | Check internet, API key, URL |
| `App crashes on start` | Check for TypeScript errors: `npm run type-check` |

## Build Commands

```bash
# Development
npm start                    # Start Expo server
npm run android             # Run on Android
npm run ios                 # Run on iOS
npm run web                 # Run on web

# Production
npm run build:android       # Build APK/AAB
npm run build:ios          # Build IPA
eas submit --platform android  # Submit to Play Store
eas submit --platform ios      # Submit to App Store

# Type checking
npm run type-check          # Check TypeScript
npm run lint               # Run ESLint
```

## Documentation

- **Setup**: `README.md`
- **Quick Start**: `QUICKSTART.md`
- **Architecture**: `ARCHITECTURE.md`
- **Checklist**: `SETUP_CHECKLIST.md`
- **Development**: `DEVELOPMENT_NOTES.md`
- **Files**: `FILE_MANIFEST.md`

## Key Files to Know

- `src/App.tsx` - App entry point
- `src/navigation/RootNavigator.tsx` - Navigation setup
- `src/screens/auth/LoginScreen.tsx` - Login UI
- `src/screens/tabs/LearnScreen.tsx` - Learn feature
- `src/screens/tabs/TranslateScreen.tsx` - Translate feature
- `src/screens/tabs/BlitzScreen.tsx` - Blitz feature
- `src/config/firebase.ts` - Firebase setup
- `src/config/supabase.ts` - Supabase setup
- `src/utils/grokApi.ts` - Grok API client
- `src/utils/colors.ts` - UI colors
- `app.json` - App configuration
- `.env.local` - Secrets (not in repo)

## Keyboard Shortcuts (In Expo)

- `a` - Open Android emulator
- `i` - Open iOS simulator
- `w` - Open web browser
- `r` - Reload app
- `m` - Toggle menu
- `q` - Quit
- `d` - Open debugger

## Useful Docs

- [Expo](https://docs.expo.dev)
- [React Native](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [Firebase](https://firebase.google.com/docs)
- [Supabase](https://supabase.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript](https://www.typescriptlang.org/docs)

## Chat GPT Prompts

### For new features
```
I want to add [feature]. 
Current app structure: Expo + React Native + TypeScript
Already using: Firebase Auth, Supabase, Grok API, WebRTC
Can you write a [component/utility/screen] that...
```

### For debugging
```
I'm getting error: [error message]
My code: [paste relevant code]
What's wrong and how do I fix it?
```

### For optimization
```
This screen loads slowly.
Current implementation: [describe]
How can I optimize performance?
```

## Deployment Checklist

- [ ] All screens working
- [ ] No console errors
- [ ] Permissions configured
- [ ] Privacy policy added
- [ ] Icons created (1024x1024)
- [ ] Splash screen created
- [ ] Screenshots prepared (6)
- [ ] Description written
- [ ] Tested on real device
- [ ] Beta testers feedback resolved

---

**Print this page or bookmark it!** 📌
