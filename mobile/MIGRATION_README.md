

This migration system helps you convert components from the Vite React web app (`frontend/`) to React Native Expo (`mobile/`).

## 📁 Files in This Migration System

- **`MIGRATION_GUIDE.md`** - Comprehensive step-by-step migration guide
- **`COMPONENT_MAPPING.md`** - Quick reference for component conversions
- **`migration-utils.js`** - Helper functions and utilities for conversions
- **`convert-component.js`** - Automated conversion script (basic)

## 🚀 Quick Start

### Option 1: Manual Conversion (Recommended)

1. Open the web component you want to convert (e.g., `frontend/src/pages/Home.jsx`)
2. Follow the patterns in `MIGRATION_GUIDE.md`
3. Create the React Native version in `mobile/src/screens/Patient/` (or appropriate folder)
4. Use `COMPONENT_MAPPING.md` as a quick reference

### Option 2: Automated Conversion (Basic)

The `convert-component.js` script provides basic automated conversions:

```bash
# Convert a component
node mobile/convert-component.js frontend/src/pages/Home.jsx mobile/src/screens/Patient/PatientHomeScreen.js
```

**⚠️ Important:** The automated script only does basic conversions. You MUST manually review and adjust:
- StyleSheet creation from className
- Image source paths (require() vs { uri: ... })
- Navigation routes
- Text wrapping
- DOM-specific code removal

## 📋 Conversion Checklist

When converting any component, ensure:

- [ ] All HTML elements → React Native components
- [ ] All `className` → `style` with StyleSheet
- [ ] All `onClick` → `onPress`
- [ ] All `<img>` → `<Image>` with `source` prop
- [ ] All text wrapped in `<Text>` components
- [ ] `localStorage` → `AsyncStorage` (with async/await)
- [ ] React Router → React Navigation
- [ ] DOM APIs removed (document, window)
- [ ] Images use `require()` or `{ uri: ... }`
- [ ] Forms use `TextInput`
- [ ] Scrollable content uses `ScrollView` or `FlatList`

## 🔄 Conversion Workflow

### Step 1: Identify the Component

- **Web location:** `frontend/src/pages/Home.jsx`
- **React Native location:** `mobile/src/screens/Patient/PatientHomeScreen.js`

### Step 2: Update Imports

**Remove:**
```jsx
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
```

**Add:**
```jsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
```

### Step 3: Convert HTML Elements

- `<div>` → `<View>`
- `<span>`, `<p>`, `<h1-6>` → `<Text>`
- `<button>`, `<a>` → `<TouchableOpacity>`
- `<img>` → `<Image>`
- `<input>` → `<TextInput>`

### Step 4: Convert Styling

Convert Tailwind classes to StyleSheet:

```jsx
// Before
<div className="flex items-center p-4 bg-white">

// After
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
});

<View style={styles.container}>
```

### Step 5: Convert Routing

```jsx
// Before
const navigate = useNavigate()
navigate('/doctors')

// After
const navigation = useNavigation()
navigation.navigate('Doctors')
```

### Step 6: Convert Storage

```jsx
// Before
localStorage.setItem('token', token)

// After
await AsyncStorage.setItem('token', token)
```

### Step 7: Test and Refine

- Test navigation
- Check styling on different screen sizes
- Verify API calls work
- Test forms and inputs

## 📚 Reference Documents

### For Detailed Instructions
- Read **`MIGRATION_GUIDE.md`** for comprehensive step-by-step instructions

### For Quick Lookups
- Use **`COMPONENT_MAPPING.md`** as a quick reference while converting

### For Helper Functions
- Import utilities from **`migration-utils.js`** if needed

## 🎯 Example Conversion

See `MIGRATION_GUIDE.md` for a complete example converting `Home.jsx` to `PatientHomeScreen.js`.

## 🔍 Common Patterns

### Loading State

```jsx
// Web
{isLoading && <div className="spinner">Loading...</div>}

// React Native
{isLoading && <ActivityIndicator size="large" color="#3b82f6" />}
```

### Conditional Rendering

```jsx
// Web
{token && <Navbar />}

// React Native (same)
{token && <Header />}
```

### Lists

```jsx
// Web
{items.map(item => <div key={item.id}>{item.name}</div>)}

// React Native
{items.map(item => (
  <View key={item.id}>
    <Text>{item.name}</Text>
  </View>
))}

// Or use FlatList for better performance
<FlatList
  data={items}
  renderItem={({ item }) => (
    <View>
      <Text>{item.name}</Text>
    </View>
  )}
  keyExtractor={(item) => item.id}
/>
```

## ⚠️ Important Notes

1. **Text Wrapping:** ALL text in React Native must be inside `<Text>` components. You cannot have bare text.

2. **Async Storage:** `AsyncStorage` methods are async. Always use `await` or `.then()`.

3. **Navigation:** Screen names in `navigation.navigate()` must match the names in your `AppNavigator.js`.

4. **Images:** 
   - Local assets: `require('../assets/image.png')`
   - Remote URLs: `{ uri: 'https://...' }`
   - From assets object: `source={assets.logo}`

5. **Styling:** React Native doesn't support CSS. All styles must be JavaScript objects using StyleSheet.

6. **No DOM:** Remove all `document.*` and `window.*` usage. Use React Native APIs instead.

## 🆘 Need Help?

1. Check existing converted components in `mobile/src/screens/` for reference
2. Review `COMPONENT_MAPPING.md` for quick lookups
3. Read `MIGRATION_GUIDE.md` for detailed instructions
4. Use `migration-utils.js` helper functions if needed

## 📝 Next Steps

1. Start with simple components (like `Home.jsx`)
2. Move to more complex components (forms, lists)
3. Convert context providers (already mostly done)
4. Update navigation routes in `AppNavigator.js`
5. Test thoroughly on both iOS and Android

Happy migrating! 🚀

