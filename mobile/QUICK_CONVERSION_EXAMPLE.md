# Quick Conversion Example

This document shows a side-by-side comparison of converting a web component to React Native.

## Example: Home Page Component

### Before: Web Component (`frontend/src/pages/Home.jsx`)

```jsx
import React from 'react'
import Header from '../components/Header'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import SpecialityMenu from '../components/SpecialityMenu'
import Reviews from '../components/Reviews'

const Home = () => {
  return (
    <div className="pb-4 md:pb-0">
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Reviews />
      <Banner />
    </div>
  )
}

export default Home
```

### After: React Native Component (`mobile/src/screens/Patient/PatientHomeScreen.js`)

```jsx
import React, { useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import Header from '../../components/Header';
import SpecialityMenu from '../../components/SpecialityMenu';
import TopDoctors from '../../components/TopDoctors';
import Reviews from '../../components/Reviews';
import Banner from '../../components/Banner';

const PatientHomeScreen = ({ navigation }) => {
  const { getDoctorsData } = useContext(AppContext);

  useEffect(() => {
    getDoctorsData();
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Reviews />
      <Banner />
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    paddingBottom: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default PatientHomeScreen;
```

## Key Changes Explained

### 1. Imports Changed

**Removed:**
- None (this component was simple)

**Added:**
- `View, StyleSheet, ScrollView` from 'react-native'
- `useContext, useEffect` from 'react'
- `AppContext` for data fetching
- `navigation` prop (for future navigation needs)

### 2. Component Structure

**Before:**
```jsx
<div className="pb-4 md:pb-0">
```

**After:**
```jsx
<ScrollView 
  style={styles.container} 
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.contentContainer}
>
```

**Why:**
- `<div>` → `<ScrollView>` for scrollable content
- `className` → `style` with StyleSheet
- `pb-4` (padding-bottom) → `contentContainerStyle` with padding
- Removed responsive `md:pb-0` (not needed in mobile-first RN)

### 3. Added Functionality

**Added:**
```jsx
const { getDoctorsData } = useContext(AppContext);

useEffect(() => {
  getDoctorsData();
}, []);
```

**Why:**
- Mobile version explicitly fetches data on mount
- Web version might fetch elsewhere or rely on context

### 4. Styling Conversion

**Before:**
```jsx
className="pb-4 md:pb-0"
```

**After:**
```jsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // Added default background
  },
  contentContainer: {
    paddingBottom: 16, // pb-4 = 16px
  },
  bottomSpacing: {
    height: 20, // Extra spacing at bottom
  },
});
```

**Why:**
- Tailwind classes converted to StyleSheet properties
- Added explicit background color
- Added bottom spacing for better UX

### 5. Component Name

**Before:** `Home`
**After:** `PatientHomeScreen`

**Why:**
- React Native screens typically have descriptive names
- Indicates it's a screen (not a component)
- Indicates user type (Patient)

## More Complex Example: Login Component

### Before: Web (`frontend/src/pages/Login.jsx` - simplified)

```jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/user/login', { email, password })
      if (data.success) {
        localStorage.setItem('token', data.token)
        toast.success('Welcome back!')
        navigate('/')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  )
}
```

### After: React Native (`mobile/src/screens/PatientLoginScreen.js`)

```jsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const PatientLoginScreen = () => {
  const navigation = useNavigation();
  const { backendUrl, setToken } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/login', { 
        email, 
        password 
      });
      
      if (data.success) {
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);
        Alert.alert('Success', 'Welcome back!');
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity 
            onPress={handleSubmit}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PatientLoginScreen;
```

## Key Changes in Login Example

### 1. Imports

**Removed:**
- `useNavigate` from 'react-router-dom'
- `toast` from 'react-toastify'

**Added:**
- React Native components: `View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform`
- `useNavigation` from '@react-navigation/native'
- `AsyncStorage` from '@react-native-async-storage/async-storage'
- `AppContext` for backend URL and token management

### 2. Event Handling

**Before:**
```jsx
<form onSubmit={handleSubmit}>
  <button type="submit">Login</button>
</form>
```

**After:**
```jsx
<TouchableOpacity onPress={handleSubmit}>
  <Text>Login</Text>
</TouchableOpacity>
```

**Why:**
- No `<form>` in React Native
- `onSubmit` → `onPress`
- `type="submit"` not needed

### 3. Input Fields

**Before:**
```jsx
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Email"
/>
```

**After:**
```jsx
<TextInput
  value={email}
  onChangeText={setEmail}
  placeholder="Email"
  keyboardType="email-address"
  autoCapitalize="none"
  style={styles.input}
/>
```

**Why:**
- `<input>` → `<TextInput>`
- `onChange` → `onChangeText` (directly receives string, not event)
- `type="email"` → `keyboardType="email-address"`
- Added `autoCapitalize="none"` for email

### 4. Storage

**Before:**
```jsx
localStorage.setItem('token', data.token)
```

**After:**
```jsx
await AsyncStorage.setItem('token', data.token)
```

**Why:**
- `localStorage` → `AsyncStorage`
- Must use `await` (async operation)

### 5. Notifications

**Before:**
```jsx
toast.success('Welcome back!')
toast.error(error.message)
```

**After:**
```jsx
Alert.alert('Success', 'Welcome back!')
Alert.alert('Error', error.message)
```

**Why:**
- `react-toastify` not available in React Native
- Use native `Alert` component

### 6. Navigation

**Before:**
```jsx
const navigate = useNavigate()
navigate('/')
```

**After:**
```jsx
const navigation = useNavigation()
navigation.navigate('Home')
```

**Why:**
- React Router → React Navigation
- Route paths → Screen names

### 7. Keyboard Handling

**Added:**
```jsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
```

**Why:**
- Mobile keyboards can cover inputs
- `KeyboardAvoidingView` prevents this
- Different behavior for iOS vs Android

## Summary

The main conversion patterns are:

1. **HTML → React Native components**
2. **CSS classes → StyleSheet**
3. **React Router → React Navigation**
4. **localStorage → AsyncStorage**
5. **toast → Alert**
6. **Forms → View with TextInput and TouchableOpacity**
7. **Add mobile-specific features** (KeyboardAvoidingView, etc.)

Use these examples as templates when converting other components!

