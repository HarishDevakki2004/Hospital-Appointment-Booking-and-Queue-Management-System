# Migration Guide: Vite React Web → React Native Expo

This guide helps you convert components from the Vite React web app (`frontend/`) to React Native Expo (`mobile/`).

## Quick Reference

### Component Mapping

| Web (HTML/React) | React Native | Notes |
|-----------------|--------------|-------|
| `<div>` | `<View>` | Container component |
| `<span>`, `<p>`, `<h1-6>` | `<Text>` | All text must be in Text |
| `<button>`, `<a>` | `<TouchableOpacity>` | Interactive elements |
| `<img>` | `<Image>` | Use `source` prop instead of `src` |
| `<input>` | `<TextInput>` | Text input fields |
| `<textarea>` | `<TextInput>` | With `multiline={true}` |
| `<ul>`, `<ol>`, `<li>` | `<View>` | Use `FlatList` for lists |
| `<nav>` | `<View>` | Navigation handled by React Navigation |

### Event Handlers

| Web | React Native |
|-----|--------------|
| `onClick` | `onPress` |
| `onChange` | `onChangeText` (TextInput) |
| `onSubmit` | `onSubmitEditing` (TextInput) |

### Styling

| Web (Tailwind/CSS) | React Native (StyleSheet) |
|-------------------|---------------------------|
| `className="flex items-center"` | `style={{ flexDirection: 'row', alignItems: 'center' }}` |
| `className="p-4"` | `style={{ padding: 16 }}` |
| `className="bg-blue-500"` | `style={{ backgroundColor: '#3b82f6' }}` |
| `className="text-white"` | `style={{ color: '#ffffff' }}` |
| `className="rounded-lg"` | `style={{ borderRadius: 8 }}` |

### Routing

| Web (React Router) | React Native (React Navigation) |
|-------------------|--------------------------------|
| `useNavigate()` | `useNavigation()` |
| `<NavLink to="/path">` | `<TouchableOpacity onPress={() => navigation.navigate('ScreenName')}>` |
| `useParams()` | `route.params` |
| `<Navigate to="/path" />` | `navigation.navigate('ScreenName')` |

### Storage

| Web | React Native |
|-----|--------------|
| `localStorage.getItem('key')` | `await AsyncStorage.getItem('key')` |
| `localStorage.setItem('key', value)` | `await AsyncStorage.setItem('key', value)` |
| `localStorage.removeItem('key')` | `await AsyncStorage.removeItem('key')` |

### Images

| Web | React Native |
|-----|--------------|
| `<img src="/path/to/image.png" />` | `<Image source={require('../assets/image.png')} />` |
| `<img src={assets.logo} />` | `<Image source={assets.logo} />` |
| `<img src="https://..." />` | `<Image source={{ uri: 'https://...' }} />` |

## Step-by-Step Conversion Process

### 1. Update Imports

**Before (Web):**
```jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets.js'
```

**After (React Native):**
```jsx
import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { assets } from '../assets/assets'
```

### 2. Replace HTML Elements

**Before (Web):**
```jsx
<div className="container">
  <h1>Title</h1>
  <button onClick={handleClick}>Click me</button>
  <img src={logo} alt="Logo" />
</div>
```

**After (React Native):**
```jsx
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
  <TouchableOpacity onPress={handleClick}>
    <Text>Click me</Text>
  </TouchableOpacity>
  <Image source={logo} style={styles.logo} />
</View>
```

### 3. Convert CSS to StyleSheet

**Before (Web):**
```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg">
```

**After (React Native):**
```jsx
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
});

<View style={styles.container}>
```

### 4. Convert Routing

**Before (Web):**
```jsx
import { useNavigate, NavLink } from 'react-router-dom'

const navigate = useNavigate()

<NavLink to="/doctors">Doctors</NavLink>
<button onClick={() => navigate('/profile')}>Profile</button>
```

**After (React Native):**
```jsx
import { useNavigation } from '@react-navigation/native'

const navigation = useNavigation()

<TouchableOpacity onPress={() => navigation.navigate('Doctors')}>
  <Text>Doctors</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => navigation.navigate('Profile')}>
  <Text>Profile</Text>
</TouchableOpacity>
```

### 5. Convert Storage

**Before (Web):**
```jsx
localStorage.setItem('token', token)
const token = localStorage.getItem('token')
localStorage.removeItem('token')
```

**After (React Native):**
```jsx
import AsyncStorage from '@react-native-async-storage/async-storage'

await AsyncStorage.setItem('token', token)
const token = await AsyncStorage.getItem('token')
await AsyncStorage.removeItem('token')
```

### 6. Handle Responsive Design

**Before (Web):**
```jsx
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

**After (React Native):**
```jsx
import { Dimensions } from 'react-native'

const { width } = Dimensions.get('window')
const isTablet = width > 768

{isTablet && <View><Text>Tablet only</Text></View>}
{!isTablet && <View><Text>Mobile only</Text></View>}
```

### 7. Remove DOM-Specific Code

**Before (Web):**
```jsx
useEffect(() => {
  document.title = 'Page Title'
  window.scrollTo(0, 0)
}, [])
```

**After (React Native):**
```jsx
import { useFocusEffect } from '@react-navigation/native'

useFocusEffect(
  React.useCallback(() => {
    // Screen focused - equivalent to component mount
    return () => {
      // Screen unfocused - cleanup
    }
  }, [])
)
```

### 8. Convert Forms

**Before (Web):**
```jsx
<form onSubmit={handleSubmit}>
  <input 
    type="text" 
    value={name} 
    onChange={(e) => setName(e.target.value)} 
  />
  <button type="submit">Submit</button>
</form>
```

**After (React Native):**
```jsx
<View>
  <TextInput
    value={name}
    onChangeText={setName}
    style={styles.input}
  />
  <TouchableOpacity onPress={handleSubmit}>
    <Text>Submit</Text>
  </TouchableOpacity>
</View>
```

## Common Patterns

### Loading Spinner

**Web:**
```jsx
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
```

**React Native:**
```jsx
import { ActivityIndicator } from 'react-native'

<ActivityIndicator size="large" color="#3b82f6" />
```

### Toast Notifications

**Web:**
```jsx
import { toast } from 'react-toastify'
toast.success('Success!')
```

**React Native:**
```jsx
import { Alert } from 'react-native'
// Or use a library like react-native-toast-message

Alert.alert('Success', 'Operation completed!')
```

### Scrollable Content

**Web:**
```jsx
<div className="overflow-y-auto">
  {/* content */}
</div>
```

**React Native:**
```jsx
<ScrollView 
  style={styles.container}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.contentContainer}
>
  {/* content */}
</ScrollView>
```

## File Structure Mapping

| Web Location | React Native Location |
|-------------|----------------------|
| `frontend/src/pages/Home.jsx` | `mobile/src/screens/Patient/PatientHomeScreen.js` |
| `frontend/src/components/Header.jsx` | `mobile/src/components/Header.js` |
| `frontend/src/context/AppContext.jsx` | `mobile/src/context/AppContext.js` |
| `frontend/src/assets/` | `mobile/src/assets/` |

## Component Conversion Checklist

When converting a component, ensure:

- [ ] All HTML elements replaced with React Native components
- [ ] All `className` converted to `style` with StyleSheet
- [ ] All `onClick` changed to `onPress`
- [ ] All `<img>` changed to `<Image>` with `source` prop
- [ ] All text wrapped in `<Text>` components
- [ ] `localStorage` replaced with `AsyncStorage` (async/await)
- [ ] React Router hooks replaced with React Navigation
- [ ] DOM APIs removed (document, window)
- [ ] Responsive classes converted to Dimensions-based logic
- [ ] Images use `require()` for local assets or `{ uri: '...' }` for remote
- [ ] Forms use `TextInput` instead of `<input>`
- [ ] Scrollable content uses `ScrollView` or `FlatList`
- [ ] Navigation uses `navigation.navigate()` instead of `navigate()`

## Example: Complete Component Conversion

### Before (Web - `frontend/src/pages/Home.jsx`):
```jsx
import React from 'react'
import Header from '../components/Header'
import TopDoctors from '../components/TopDoctors'

const Home = () => {
  return (
    <div className="pb-4 md:pb-0">
      <Header />
      <TopDoctors />
    </div>
  )
}

export default Home
```

### After (React Native - `mobile/src/screens/Patient/PatientHomeScreen.js`):
```jsx
import React, { useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import Header from '../../components/Header';
import TopDoctors from '../../components/TopDoctors';

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
      <TopDoctors />
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
});

export default PatientHomeScreen;
```

## Need Help?

- Check `migration-utils.js` for helper functions
- See existing converted components in `mobile/src/screens/` for reference
- Use the conversion helper script (coming soon)

