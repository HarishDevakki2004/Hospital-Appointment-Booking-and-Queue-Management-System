# 📱 MediQ Mobile App (React Native)

React Native mobile application for MediQ Mobile - Slot-Based Token Booking System

## ✅ Setup Complete

The React Native app has been set up with:
- ✅ Expo framework
- ✅ React Navigation
- ✅ Context API (reused from web)
- ✅ Authentication (Login/Register)
- ✅ API integration (same backend as web)

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
cd mobile
npm install
```

### 2. Start Development Server
```bash
npm start
# or
expo start
```

### 3. Run on Device
- **iOS**: Press `i` or scan QR code with Camera app
- **Android**: Press `a` or scan QR code with Expo Go app
- **Web**: Press `w` (for testing)

## 📁 Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   └── HomeScreen.js
│   ├── components/       # Reusable components
│   ├── context/          # Context providers (reused logic)
│   │   └── AppContext.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── services/         # API services
│   ├── hooks/            # Custom hooks
│   └── utils/            # Utility functions
├── App.js                # Root component
└── package.json
```

## 🔄 Code Reuse

### ✅ Reused from Web:
- **Business Logic**: 100% reused (API calls, state management)
- **Context Providers**: Adapted from web (AsyncStorage instead of localStorage)
- **API Integration**: Same endpoints, same logic
- **Authentication**: Same flow, adapted UI

### ⚠️ Adapted for Mobile:
- **UI Components**: React Native components (View, Text, TouchableOpacity)
- **Navigation**: React Navigation instead of React Router
- **Storage**: AsyncStorage instead of localStorage
- **Styling**: StyleSheet instead of Tailwind CSS

## 🔌 Backend Connection

The app uses the same backend as the web app:
- **Default URL**: `http://localhost:4000`
- **Configure**: Set `EXPO_PUBLIC_BACKEND_URL` in `.env` or `app.json`

## 📱 Features Implemented

- ✅ User Authentication (Login/Register)
- ✅ Context API (same as web)
- ✅ Navigation setup
- ✅ API integration

## 🚧 Next Steps

1. Add more screens (Doctors, Appointments, etc.)
2. Implement slot booking
3. Add real-time updates (Socket.IO)
4. Add maps integration
5. Add notifications

## 📝 Notes

- Uses same backend API as web app
- Business logic is 100% reused
- Only UI layer is adapted for mobile
- All API endpoints work the same


