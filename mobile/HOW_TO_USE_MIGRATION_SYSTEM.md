# How to Use the Migration System

This document explains how to use the migration system to convert Vite React web components to React Native Expo.

## 🎯 Overview

When you open a file from `frontend/` (Vite React web app), you can use this migration system to convert it to React Native format for `mobile/` (Expo React Native app).

## 📚 Available Resources

### 1. **MIGRATION_README.md** - Start Here!
   - Overview of the migration system
   - Quick start guide
   - Conversion checklist
   - Common patterns

### 2. **MIGRATION_GUIDE.md** - Detailed Instructions
   - Step-by-step conversion process
   - Complete examples
   - Best practices
   - Troubleshooting tips

### 3. **COMPONENT_MAPPING.md** - Quick Reference
   - HTML → React Native component mapping
   - CSS → StyleSheet conversion table
   - React Router → React Navigation mapping
   - Common patterns and examples

### 4. **QUICK_CONVERSION_EXAMPLE.md** - Side-by-Side Examples
   - Before/after comparisons
   - Real component conversions
   - Key changes explained

### 5. **migration-utils.js** - Helper Functions
   - Utility functions for conversions
   - Component mapping functions
   - Style conversion helpers

### 6. **convert-component.js** - Automated Script
   - Basic automated conversions
   - Usage: `node mobile/convert-component.js <source> [output]`

## 🚀 Quick Start Workflow

### Step 1: Identify What to Convert

When you open a file from `frontend/`, determine:
- **Type:** Is it a page, component, context, or utility?
- **Location:** Where should it go in `mobile/`?
- **Dependencies:** What other files does it depend on?

### Step 2: Choose Your Approach

#### Option A: Manual Conversion (Recommended for Learning)
1. Open the web component
2. Open `COMPONENT_MAPPING.md` for quick reference
3. Follow patterns in `QUICK_CONVERSION_EXAMPLE.md`
4. Create React Native version step by step

#### Option B: Automated + Manual Review
1. Run the conversion script:
   ```bash
   node mobile/convert-component.js frontend/src/pages/Home.jsx mobile/src/screens/Patient/PatientHomeScreen.js
   ```
2. Review the output
3. Manually fix:
   - StyleSheet creation
   - Image sources
   - Navigation routes
   - Text wrapping
   - DOM-specific code

### Step 3: Follow the Conversion Checklist

Use this checklist for every component:

- [ ] **Imports Updated**
  - Removed: `react-router-dom`, `react-toastify`, DOM APIs
  - Added: React Native components, React Navigation, AsyncStorage

- [ ] **HTML Elements Converted**
  - `<div>` → `<View>`
  - `<span>`, `<p>`, `<h1-6>` → `<Text>`
  - `<button>`, `<a>` → `<TouchableOpacity>`
  - `<img>` → `<Image>`
  - `<input>` → `<TextInput>`

- [ ] **Styling Converted**
  - `className` → `style` with StyleSheet
  - Tailwind classes → StyleSheet properties
  - Created `StyleSheet.create()` at bottom

- [ ] **Events Converted**
  - `onClick` → `onPress`
  - `onChange` → `onChangeText` (for TextInput)
  - `onSubmit` → `onSubmitEditing` (for TextInput)

- [ ] **Routing Converted**
  - `useNavigate()` → `useNavigation()`
  - `navigate('/path')` → `navigation.navigate('ScreenName')`
  - `NavLink` → `TouchableOpacity` with `navigation.navigate()`

- [ ] **Storage Converted**
  - `localStorage` → `AsyncStorage`
  - Added `await` for async operations
  - Wrapped in try/catch if needed

- [ ] **Images Converted**
  - Local: `require('../assets/image.png')`
  - Remote: `{ uri: 'https://...' }`
  - From assets: `source={assets.logo}`

- [ ] **DOM Code Removed**
  - No `document.*`
  - No `window.*` (except via React Native APIs)
  - No `localStorage` (use AsyncStorage)

- [ ] **Text Wrapped**
  - All text inside `<Text>` components
  - No bare text in JSX

- [ ] **Mobile Optimizations**
  - Added `ScrollView` for scrollable content
  - Added `KeyboardAvoidingView` for forms
  - Considered screen sizes with `Dimensions`

### Step 4: Test Your Conversion

1. **Check Navigation**
   - Ensure screen names match `AppNavigator.js`
   - Test navigation flows

2. **Check Styling**
   - Verify styles look correct
   - Test on different screen sizes

3. **Check Functionality**
   - Test API calls
   - Test forms and inputs
   - Test data loading

4. **Check Platform**
   - Test on iOS (if available)
   - Test on Android (if available)

## 📖 Reading Order

If you're new to the migration system, read in this order:

1. **MIGRATION_README.md** - Get overview and quick start
2. **QUICK_CONVERSION_EXAMPLE.md** - See real examples
3. **COMPONENT_MAPPING.md** - Keep open as reference
4. **MIGRATION_GUIDE.md** - Deep dive when needed

## 🔍 Common Scenarios

### Scenario 1: Converting a Page Component

**Example:** `frontend/src/pages/Home.jsx` → `mobile/src/screens/Patient/PatientHomeScreen.js`

1. Read `QUICK_CONVERSION_EXAMPLE.md` (Home example)
2. Follow the pattern
3. Update imports
4. Convert HTML → React Native
5. Convert styling
6. Add navigation prop
7. Wrap in ScrollView if needed

### Scenario 2: Converting a Component

**Example:** `frontend/src/components/Header.jsx` → `mobile/src/components/Header.js`

1. Check if similar component exists in `mobile/src/components/`
2. Use `COMPONENT_MAPPING.md` for element conversions
3. Convert styling
4. Update image sources
5. Remove web-specific features (if any)

### Scenario 3: Converting a Context

**Example:** `frontend/src/context/AppContext.jsx` → `mobile/src/context/AppContext.js`

1. Contexts are usually similar
2. Main change: `localStorage` → `AsyncStorage`
3. Update imports
4. Make storage operations async
5. Test token management

### Scenario 4: Converting Forms

**Example:** Login, Registration forms

1. Read `QUICK_CONVERSION_EXAMPLE.md` (Login example)
2. Convert `<form>` → `<View>`
3. Convert `<input>` → `<TextInput>`
4. Convert `<button>` → `<TouchableOpacity>`
5. Add `KeyboardAvoidingView`
6. Update event handlers
7. Convert `toast` → `Alert`

## 🛠️ Using the Helper Script

The `convert-component.js` script provides basic automated conversions:

```bash
# Basic usage
node mobile/convert-component.js <source-file> [output-file]

# Example
node mobile/convert-component.js \
  frontend/src/pages/Home.jsx \
  mobile/src/screens/Patient/PatientHomeScreen.js
```

**What it does:**
- Replaces basic HTML elements
- Updates imports (basic)
- Converts `localStorage` → `AsyncStorage`
- Converts `useNavigate` → `useNavigation`
- Converts `toast` → `Alert`
- Replaces `onClick` → `onPress`

**What it doesn't do (manual work needed):**
- Create proper StyleSheet from className
- Fix image sources
- Wrap text in `<Text>` components
- Update navigation routes
- Remove DOM-specific code
- Add mobile optimizations

## 💡 Pro Tips

1. **Start Simple:** Begin with basic components (Home, About) before complex ones (Forms, Lists)

2. **Use Existing Code:** Check `mobile/src/screens/` for already-converted components as reference

3. **Keep Reference Open:** Keep `COMPONENT_MAPPING.md` open while converting

4. **Test Incrementally:** Convert and test one component at a time

5. **Check Navigation:** Ensure screen names in `navigation.navigate()` match `AppNavigator.js`

6. **Image Assets:** Copy images from `frontend/src/assets/` to `mobile/src/assets/` if needed

7. **API Calls:** Usually stay the same, just verify `backendUrl` is correct

8. **Context Usage:** Contexts are mostly the same, just storage changes

## 🆘 Troubleshooting

### Problem: Component doesn't render
- **Check:** All text wrapped in `<Text>`
- **Check:** All imports correct
- **Check:** No DOM APIs used

### Problem: Navigation doesn't work
- **Check:** Screen name matches `AppNavigator.js`
- **Check:** Using `navigation.navigate()` correctly
- **Check:** Screen registered in navigator

### Problem: Styles look wrong
- **Check:** StyleSheet created properly
- **Check:** Styles applied with `style={styles.name}`
- **Check:** No CSS classes left

### Problem: Images don't show
- **Check:** Using `require()` for local assets
- **Check:** Using `{ uri: ... }` for remote URLs
- **Check:** Image paths are correct

### Problem: Forms don't work
- **Check:** Using `TextInput` not `<input>`
- **Check:** Using `onChangeText` not `onChange`
- **Check:** Using `TouchableOpacity` not `<button>`

## 📝 Next Steps

1. **Start Converting:** Pick a simple component and convert it
2. **Reference Examples:** Use `QUICK_CONVERSION_EXAMPLE.md`
3. **Keep Learning:** Read `MIGRATION_GUIDE.md` as you go
4. **Ask for Help:** Check existing converted components

## 🎉 Success!

Once you've converted a component:
- ✅ It renders correctly
- ✅ Navigation works
- ✅ Styling looks good
- ✅ Functionality works
- ✅ No errors in console

You're ready to convert the next component!

---

**Remember:** The migration system is here to help, but manual review and testing are always required. Take your time, test thoroughly, and reference the guides as needed.

Happy migrating! 🚀

