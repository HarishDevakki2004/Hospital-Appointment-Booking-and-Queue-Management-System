# Build APK from Frontend Web App

## ✅ Setup Complete!

Your frontend React app has been configured with Capacitor and is ready to build as an APK.

## 🚀 Build APK - Step by Step

### Method 1: Using Android Studio (Recommended)

#### Step 1: Open Android Project
```bash
cd frontend
npx cap open android
```

This will open Android Studio automatically.

#### Step 2: Build APK in Android Studio

1. Wait for Android Studio to sync and index files
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for the build to complete (2-5 minutes)
4. When done, click **locate** in the notification
5. Your APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Step 3: Install APK on Phone
- Transfer the APK to your phone
- Enable "Install from Unknown Sources" in Android settings
- Install and run!

---

### Method 2: Command Line Build

#### Prerequisites:
- Android Studio installed
- Android SDK configured
- JAVA_HOME set

#### Build Commands:
```bash
cd frontend/android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 After Building

### To Update the App:
1. Make changes to your React code
2. Run: `npm run build`
3. Run: `npx cap sync`
4. Rebuild APK in Android Studio

### Quick Update Script:
```bash
npm run cap:build
```
This will build, sync, and open Android Studio automatically.

---

## ⚙️ Configuration

- **App Name**: MediQ
- **Package**: com.docplus.app
- **Web Directory**: dist (built from Vite)

---

## 🔧 Troubleshooting

### If build fails:
1. Make sure Android Studio is fully installed
2. Check that Android SDK is configured
3. Try: `npx cap sync` again
4. Clean build: In Android Studio → Build → Clean Project

### If app doesn't load:
- Check backend URL in `src/utils/config.js` or `src/context/AppContext.jsx`
- Make sure backend is accessible from your device
- Check network permissions in AndroidManifest.xml

---

## 📝 Notes

- The APK will work exactly like a native mobile app
- All your React code will run inside a WebView
- The app will have native Android navigation
- You can install it on any Android device

