# How to Build APK from React Native App

## Method 1: Using Expo EAS Build (Recommended - Cloud Build)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
cd mobile
eas build:configure
```

### Step 4: Build APK
```bash
# Build APK for Android
eas build --platform android --profile preview

# Or build AAB (for Google Play Store)
eas build --platform android --profile production
```

The APK will be downloaded automatically when the build completes.

---

## Method 2: Using Expo Development Build (Local)

### Step 1: Install Android Studio
- Download from: https://developer.android.com/studio
- Install Android SDK and set up an emulator

### Step 2: Install Java JDK
- Install Java JDK 17 or later
- Set JAVA_HOME environment variable

### Step 3: Build APK Locally
```bash
cd mobile

# Install dependencies
npm install

# Build APK (requires Android Studio setup)
npx expo prebuild
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

---

## Method 3: Using Expo Go (For Testing Only)

### Quick Testing
```bash
cd mobile
npm start
```

Then scan QR code with Expo Go app on your phone. This is for development only, not a real APK.

---

## Method 4: Convert Frontend Web App to APK (Alternative)

If you want to convert the frontend web app to APK:

### Using Capacitor (Recommended)

1. Install Capacitor:
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
```

2. Add Android platform:
```bash
npx cap add android
```

3. Build web app:
```bash
npm run build
```

4. Sync with Capacitor:
```bash
npx cap sync
```

5. Build APK:
```bash
npx cap open android
# Then build in Android Studio
```

---

## Recommended: Use React Native App (mobile folder)

The React Native app in the `mobile/` folder is already set up and ready to build. Use **Method 1 (EAS Build)** for the easiest APK generation.

### Quick Start:
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

The APK will be ready in about 10-15 minutes!

