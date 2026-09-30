# GrokAIr - Quick Start Guide

Get up and running in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Create .env.local File

Copy the example and add your credentials:

```bash
cp .env.example .env.local
```

**Minimal credentials needed to run:**
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key

GROK_API_KEY=your_grok_key
```

## 3. Start the Dev Server

```bash
npm start
```

You'll see a QR code in the terminal.

## 4. Run on Your Device

### Android
- Install Expo Go from Google Play
- Scan the QR code
- App loads in Expo Go

### iOS
- Install Expo Go from App Store
- Scan the QR code with your camera
- App opens in Expo Go

### Web (limited)
```bash
npm run web
```
Opens in browser (no audio on web currently).

## 5. Test Login

The app will show a login screen. Create a test account or use:
- **Email**: test@example.com
- **Password**: Test123!

After login, you'll see three tabs: Learn, Translate, Blitz.

## Next: Explore Features

### Learn Tab
- See sample lessons for Spanish
- Tap a lesson to start
- Follow the steps (Listen → Repeat → Learn)

### Translate Tab
- Choose a connection method (QR, code, wait)
- Simulated chat with live translation display

### Blitz Tab
- Enable "Discover" to simulate finding nearby users
- Tap a user to start a 2-minute chat
- Chat extends at time's up

## Set Up Real Data (Optional)

### Firebase Auth
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Authentication → Email/Password
4. Copy credentials to `.env.local`

### Supabase
1. Go to https://supabase.com
2. Create a new project
3. In SQL Editor, paste contents of `db-schema.sql`
4. Copy URL and Anon Key to `.env.local`

### Grok API
1. Get API key from https://developer.x.ai
2. Add to `.env.local` as `GROK_API_KEY`

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### App crashes on start
- Check `.env.local` exists and has valid keys
- Check `app.json` is not corrupted
- Check no TypeScript errors: `npm run type-check`

### Microphone permission denied
- **Android**: Grant microphone permission in device settings
- **iOS**: Go to Settings → Echo Companion → Microphone → Allow

### Expo Go not connecting
- Same WiFi as your computer
- Try: `npm start -- --tunnel` (uses Expo's tunnel instead of local IP)

## Build for Production

When ready to submit to app stores:

```bash
# Create EAS account
npx eas-cli login

# Build APK/AAB for Android
npm run build:android

# Build IPA for iOS
npm run build:ios
```

See `README.md` for full build details.

## What's Mock vs Real

**Currently Mocked:**
- Lessons data (use sample data, not DB)
- BLE discovery (returns sample users)
- Grok translation (shows placeholder)
- WebRTC audio streaming (not connected)

**To Make Real:**
1. Query `supabase.from('lessons').select()` in LearnScreen
2. Implement actual BLE scanning with permissions
3. Connect Grok WebSocket and send real audio
4. Set up WebRTC peer connection

## Next Steps

1. Customize app name/logo in `app.json`
2. Add more lessons to Supabase
3. Connect real Grok API
4. Test on real devices
5. Submit to TestFlight/Google Play

For full setup, see `README.md`.

Good luck! 🚀
