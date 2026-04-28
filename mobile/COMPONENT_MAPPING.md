# Component Mapping Reference

Quick reference for converting web components to React Native.

## HTML → React Native Components

### Layout Components

```jsx
// Web
<div className="container">
  <section className="content">
    <article>...</article>
  </section>
</div>

// React Native
<View style={styles.container}>
  <View style={styles.content}>
    <View>...</View>
  </View>
</View>
```

### Text Components

```jsx
// Web
<h1>Title</h1>
<p>Paragraph text</p>
<span>Inline text</span>

// React Native
<Text style={styles.title}>Title</Text>
<Text style={styles.paragraph}>Paragraph text</Text>
<Text>Inline text</Text>
```

**Important:** In React Native, ALL text must be inside `<Text>` components. You cannot have bare text.

### Interactive Components

```jsx
// Web
<button onClick={handleClick}>Click me</button>
<a href="/page">Link</a>

// React Native
<TouchableOpacity onPress={handleClick}>
  <Text>Click me</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('Page')}>
  <Text>Link</Text>
</TouchableOpacity>
```

### Images

```jsx
// Web
<img src={logo} alt="Logo" />
<img src="/assets/image.png" />
<img src="https://example.com/image.jpg" />

// React Native - Local assets
<Image source={require('../assets/image.png')} style={styles.image} />

// React Native - From assets object
<Image source={logo} style={styles.image} />

// React Native - Remote URL
<Image source={{ uri: 'https://example.com/image.jpg' }} style={styles.image} />
```

### Forms

```jsx
// Web
<input 
  type="text" 
  value={name} 
  onChange={(e) => setName(e.target.value)} 
  placeholder="Enter name"
/>

<textarea 
  value={message} 
  onChange={(e) => setMessage(e.target.value)}
/>

// React Native
<TextInput
  value={name}
  onChangeText={setName}
  placeholder="Enter name"
  style={styles.input}
/>

<TextInput
  value={message}
  onChangeText={setMessage}
  multiline
  numberOfLines={4}
  style={styles.textArea}
/>
```

### Lists

```jsx
// Web
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// React Native - Simple list
<View>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>

// React Native - Dynamic list (recommended)
<FlatList
  data={items}
  renderItem={({ item }) => <Text>{item.name}</Text>}
  keyExtractor={(item) => item.id}
/>
```

## CSS Classes → StyleSheet

### Common Tailwind to StyleSheet Conversions

| Tailwind Class | StyleSheet Property |
|---------------|---------------------|
| `flex` | `{ display: 'flex' }` (default in RN) |
| `flex-row` | `{ flexDirection: 'row' }` |
| `flex-col` | `{ flexDirection: 'column' }` |
| `items-center` | `{ alignItems: 'center' }` |
| `items-start` | `{ alignItems: 'flex-start' }` |
| `items-end` | `{ alignItems: 'flex-end' }` |
| `justify-center` | `{ justifyContent: 'center' }` |
| `justify-between` | `{ justifyContent: 'space-between' }` |
| `justify-around` | `{ justifyContent: 'space-around' }` |
| `justify-start` | `{ justifyContent: 'flex-start' }` |
| `justify-end` | `{ justifyContent: 'flex-end' }` |
| `p-2` | `{ padding: 8 }` |
| `p-4` | `{ padding: 16 }` |
| `px-4` | `{ paddingHorizontal: 16 }` |
| `py-4` | `{ paddingVertical: 16 }` |
| `m-2` | `{ margin: 8 }` |
| `m-4` | `{ margin: 16 }` |
| `mx-4` | `{ marginHorizontal: 16 }` |
| `my-4` | `{ marginVertical: 16 }` |
| `w-full` | `{ width: '100%' }` |
| `h-full` | `{ height: '100%' }` |
| `bg-white` | `{ backgroundColor: '#ffffff' }` |
| `bg-blue-500` | `{ backgroundColor: '#3b82f6' }` |
| `text-white` | `{ color: '#ffffff' }` |
| `text-gray-600` | `{ color: '#4b5563' }` |
| `text-sm` | `{ fontSize: 14 }` |
| `text-base` | `{ fontSize: 16 }` |
| `text-lg` | `{ fontSize: 18 }` |
| `text-xl` | `{ fontSize: 20 }` |
| `font-bold` | `{ fontWeight: 'bold' }` |
| `font-medium` | `{ fontWeight: '500' }` |
| `rounded` | `{ borderRadius: 4 }` |
| `rounded-md` | `{ borderRadius: 6 }` |
| `rounded-lg` | `{ borderRadius: 8 }` |
| `rounded-full` | `{ borderRadius: 9999 }` |
| `border` | `{ borderWidth: 1 }` |
| `border-gray-200` | `{ borderColor: '#e5e7eb' }` |
| `shadow-sm` | `{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }` |
| `shadow-md` | `{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 }` |
| `hidden` | `{ display: 'none' }` |
| `absolute` | `{ position: 'absolute' }` |
| `relative` | `{ position: 'relative' }` |

### Example Conversion

```jsx
// Web
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded">Click</button>
</div>

// React Native
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
  },
});

<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
  <TouchableOpacity style={styles.button}>
    <Text style={styles.buttonText}>Click</Text>
  </TouchableOpacity>
</View>
```

## React Router → React Navigation

### Navigation Hooks

```jsx
// Web
import { useNavigate, useParams, NavLink } from 'react-router-dom'

const navigate = useNavigate()
const { id } = useParams()

navigate('/doctors')
navigate('/profile', { replace: true })

// React Native
import { useNavigation, useRoute } from '@react-navigation/native'

const navigation = useNavigation()
const route = useRoute()
const { id } = route.params

navigation.navigate('Doctors')
navigation.replace('Profile')
```

### Navigation Links

```jsx
// Web
<NavLink to="/doctors" className="nav-link">
  Doctors
</NavLink>

<Link to="/profile">Profile</Link>

// React Native
<TouchableOpacity 
  onPress={() => navigation.navigate('Doctors')}
  style={styles.navLink}
>
  <Text>Doctors</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('Profile')}>
  <Text>Profile</Text>
</TouchableOpacity>
```

### Route Parameters

```jsx
// Web - App.jsx
<Route path="/doctor/:docId" element={<DoctorProfile />} />

// Component
const { docId } = useParams()

// React Native - AppNavigator.js
<Stack.Screen 
  name="DoctorProfile" 
  component={DoctorProfileScreen}
/>

// Component
const { docId } = route.params
// Or
const { docId } = navigation.getState()?.routes?.find(r => r.name === 'DoctorProfile')?.params
```

## Storage: localStorage → AsyncStorage

```jsx
// Web
localStorage.setItem('token', token)
const token = localStorage.getItem('token')
localStorage.removeItem('token')

// React Native
import AsyncStorage from '@react-native-async-storage/async-storage'

// In async function
await AsyncStorage.setItem('token', token)
const token = await AsyncStorage.getItem('token')
await AsyncStorage.removeItem('token')

// In component
useEffect(() => {
  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
      }
    } catch (error) {
      console.error('Error loading token:', error)
    }
  }
  loadToken()
}, [])
```

## Event Handlers

| Web Event | React Native Event | Notes |
|-----------|-------------------|-------|
| `onClick` | `onPress` | For buttons, links, touchable areas |
| `onChange` | `onChangeText` | For TextInput only |
| `onSubmit` | `onSubmitEditing` | For TextInput form submission |
| `onFocus` | `onFocus` | Same |
| `onBlur` | `onBlur` | Same |
| `onMouseEnter` | Not available | Use `onPressIn` on TouchableOpacity |
| `onMouseLeave` | Not available | Use `onPressOut` on TouchableOpacity |

## Responsive Design

```jsx
// Web - Tailwind responsive classes
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>

// React Native
import { Dimensions } from 'react-native'

const { width } = Dimensions.get('window')
const isTablet = width > 768

{isTablet && <View><Text>Tablet only</Text></View>}
{!isTablet && <View><Text>Mobile only</Text></View>}
```

## Common Utilities

### Loading Spinner

```jsx
// Web
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>

// React Native
import { ActivityIndicator } from 'react-native'

<ActivityIndicator size="large" color="#3b82f6" />
```

### Toast/Alert

```jsx
// Web
import { toast } from 'react-toastify'
toast.success('Success!')
toast.error('Error!')

// React Native
import { Alert } from 'react-native'
Alert.alert('Success', 'Operation completed!')
Alert.alert('Error', 'Something went wrong!')

// Or use a library
import Toast from 'react-native-toast-message'
Toast.show({
  type: 'success',
  text1: 'Success!',
  text2: 'Operation completed'
})
```

### Scrollable Content

```jsx
// Web
<div className="overflow-y-auto h-screen">
  {/* content */}
</div>

// React Native
<ScrollView 
  style={styles.container}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.contentContainer}
>
  {/* content */}
</ScrollView>
```

### Modal/Dialog

```jsx
// Web
<div className="fixed inset-0 bg-black/50">
  <div className="modal-content">...</div>
</div>

// React Native
import { Modal } from 'react-native'

<Modal
  visible={isVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setIsVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* content */}
    </View>
  </View>
</Modal>
```

## File Structure

| Web Path | React Native Path |
|---------|------------------|
| `frontend/src/pages/Home.jsx` | `mobile/src/screens/Patient/PatientHomeScreen.js` |
| `frontend/src/components/Header.jsx` | `mobile/src/components/Header.js` |
| `frontend/src/context/AppContext.jsx` | `mobile/src/context/AppContext.js` |
| `frontend/src/assets/` | `mobile/src/assets/` |
| `frontend/src/utils/` | `mobile/src/utils/` |

## Naming Conventions

- Web pages: `Home.jsx`, `Login.jsx`, `MyProfile.jsx`
- React Native screens: `PatientHomeScreen.js`, `PatientLoginScreen.js`, `MyProfileScreen.js`
- Components: Keep same name but change extension: `Header.jsx` → `Header.js`

