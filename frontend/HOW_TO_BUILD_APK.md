# 📱 How to Build APK from Frontend Folder

## ✅ Yes! It will work as a native mobile app!

When you build the frontend React app as an APK using Capacitor, it will work exactly like a native mobile app with:
- Native Android navigation
- App-like feel and performance
- Installable on any Android device
- Access to device features

---

## 🚀 Build APK - Simple Steps

### Prerequisites:
1. **Android Studio** installed
   - Download: https://developer.android.com/studio
   - Install with Android SDK

2. **Java JDK** (usually comes with Android Studio)

### Step 1: Build Web App
```bash
cd frontend
npm run build
```

### Step 2: Sync with Capacitor
```bash
npx cap sync
```

### Step 3: Open in Android Studio
```bash
npx cap open android
```

### Step 4: Build APK in Android Studio
1. Wait for Android Studio to sync (first time takes 2-5 minutes)
2. Go to **Build** menu → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete
4. Click **locate** in the notification bar
5. Your APK is in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 5: Install on Phone
- Transfer APK to your Android phone
- Enable "Install from Unknown Sources" in Settings
- Tap the APK file to install
- Open the app!

---

## 🔄 Quick Update Workflow

After making code changes:

```bash
# Option 1: Manual steps
npm run build
npx cap sync
npx cap open android
# Then rebuild in Android Studio

# Option 2: Use the shortcut script
npm run cap:build
```

---

## ⚙️ Configuration

### App Details:
- **App Name**: MediQ
- **Package**: com.docplus.app
- **Version**: 1.0.0

### Backend URL:
- Check `src/context/AppContext.jsx`
- For physical device: Use your computer's IP (e.g., `http://192.168.1.100:4000`)
- Set in `.env` file: `VITE_BACKEND_URL=http://your-ip:4000`

---

## 🔧 Troubleshooting

### Build Fails:
1. Make sure Android Studio is fully installed
2. Check Android SDK is configured
3. Try: `npx cap sync` again
4. In Android Studio: **Build** → **Clean Project**

### App Can't Connect to Backend:
1. Make sure backend is running
2. Use your computer's IP address (not localhost)
3. Check firewall settings
4. Verify network permissions in AndroidManifest.xml

### App Crashes:
1. Check Android Studio Logcat for errors
2. Verify all dependencies are installed
3. Try: `npx cap sync` again

---

## 📝 Important Notes

1. **First Build**: Takes 5-10 minutes (downloads dependencies)
2. **Subsequent Builds**: 1-2 minutes
3. **APK Size**: ~10-15 MB (includes all assets)
4. **Performance**: Runs in WebView, optimized for mobile

---

## 🎯 You're Ready!

Your frontend React app is now configured to build as APK. Just follow the steps above!

