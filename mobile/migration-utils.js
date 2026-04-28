/**
 * Migration Utilities for Converting Vite React Web Components to React Native
 * 
 * This file contains helper functions and mappings to convert web components
 * to React Native equivalents.
 */

// HTML to React Native Component Mapping
export const componentMap = {
  // Basic HTML elements
  'div': 'View',
  'span': 'Text',
  'p': 'Text',
  'h1': 'Text',
  'h2': 'Text',
  'h3': 'Text',
  'h4': 'Text',
  'h5': 'Text',
  'h6': 'Text',
  'a': 'TouchableOpacity',
  'button': 'TouchableOpacity',
  'input': 'TextInput',
  'textarea': 'TextInput',
  'img': 'Image',
  'ul': 'View',
  'ol': 'View',
  'li': 'View',
  'nav': 'View',
  'header': 'View',
  'footer': 'View',
  'section': 'View',
  'article': 'View',
  'main': 'View',
  'aside': 'View',
  'form': 'View',
  'label': 'Text',
  'select': 'Picker', // Requires @react-native-picker/picker
  'option': 'Picker.Item',
};

// CSS Class to StyleSheet Property Mapping
export const cssToStyleMap = {
  // Layout
  'flex': 'flex',
  'flex-row': { flexDirection: 'row' },
  'flex-col': { flexDirection: 'column' },
  'items-center': { alignItems: 'center' },
  'justify-center': { justifyContent: 'center' },
  'justify-between': { justifyContent: 'space-between' },
  'justify-around': { justifyContent: 'space-around' },
  'justify-start': { justifyContent: 'flex-start' },
  'justify-end': { justifyContent: 'flex-end' },
  
  // Spacing
  'p-0': { padding: 0 },
  'p-1': { padding: 4 },
  'p-2': { padding: 8 },
  'p-3': { padding: 12 },
  'p-4': { padding: 16 },
  'p-6': { padding: 24 },
  'px-2': { paddingHorizontal: 8 },
  'px-4': { paddingHorizontal: 16 },
  'px-6': { paddingHorizontal: 24 },
  'py-2': { paddingVertical: 8 },
  'py-4': { paddingVertical: 16 },
  'm-0': { margin: 0 },
  'm-2': { margin: 8 },
  'm-4': { margin: 16 },
  'mx-2': { marginHorizontal: 8 },
  'mx-4': { marginHorizontal: 16 },
  'my-2': { marginVertical: 8 },
  'my-4': { marginVertical: 16 },
  
  // Colors
  'bg-white': { backgroundColor: '#ffffff' },
  'bg-gray-50': { backgroundColor: '#f9fafb' },
  'bg-gray-100': { backgroundColor: '#f3f4f6' },
  'bg-gray-200': { backgroundColor: '#e5e7eb' },
  'bg-blue-500': { backgroundColor: '#3b82f6' },
  'bg-blue-600': { backgroundColor: '#2563eb' },
  'text-white': { color: '#ffffff' },
  'text-gray-600': { color: '#4b5563' },
  'text-gray-900': { color: '#111827' },
  'text-blue-500': { color: '#3b82f6' },
  
  // Typography
  'text-sm': { fontSize: 14 },
  'text-base': { fontSize: 16 },
  'text-lg': { fontSize: 18 },
  'text-xl': { fontSize: 20 },
  'text-2xl': { fontSize: 24 },
  'font-bold': { fontWeight: 'bold' },
  'font-medium': { fontWeight: '500' },
  'font-semibold': { fontWeight: '600' },
  
  // Borders
  'rounded': { borderRadius: 4 },
  'rounded-md': { borderRadius: 6 },
  'rounded-lg': { borderRadius: 8 },
  'rounded-full': { borderRadius: 9999 },
  'border': { borderWidth: 1 },
  'border-gray-200': { borderColor: '#e5e7eb' },
  
  // Sizing
  'w-full': { width: '100%' },
  'h-full': { height: '100%' },
  'w-screen': { width: '100%' },
  'h-screen': { height: '100%' },
};

// React Router to React Navigation Mapping
export const navigationMap = {
  'useNavigate': 'navigation.navigate',
  'useParams': 'route.params',
  'NavLink': 'TouchableOpacity with navigation.navigate',
  'Link': 'TouchableOpacity with navigation.navigate',
  'Navigate': 'navigation.navigate or navigation.replace',
};

// DOM API to React Native API Mapping
export const domToNativeMap = {
  'localStorage': 'AsyncStorage',
  'window': 'Platform or Dimensions',
  'document': 'Not available - use React Native APIs',
  'document.getElementById': 'useRef hook',
  'document.querySelector': 'useRef hook',
  'window.matchMedia': 'useColorScheme hook from react-native',
  'window.innerWidth': 'Dimensions.get("window").width',
  'window.innerHeight': 'Dimensions.get("window").height',
};

/**
 * Convert Tailwind CSS classes to StyleSheet object
 * @param {string} className - Tailwind CSS class string
 * @returns {object} StyleSheet compatible object
 */
export function convertTailwindToStyle(className) {
  const classes = className.split(' ').filter(Boolean);
  const styles = {};
  
  classes.forEach(cls => {
    if (cssToStyleMap[cls]) {
      Object.assign(styles, cssToStyleMap[cls]);
    }
  });
  
  return styles;
}

/**
 * Convert HTML element to React Native component
 * @param {string} element - HTML element name
 * @returns {string} React Native component name
 */
export function convertHTMLElement(element) {
  return componentMap[element.toLowerCase()] || 'View';
}

/**
 * Convert React Router hook to React Navigation
 * @param {string} hook - React Router hook name
 * @returns {string} React Navigation equivalent
 */
export function convertRouterHook(hook) {
  return navigationMap[hook] || hook;
}

/**
 * Generate StyleSheet from className string
 * @param {string} className - Tailwind CSS classes
 * @param {object} additionalStyles - Additional styles to merge
 * @returns {object} StyleSheet object
 */
export function generateStyleSheet(className, additionalStyles = {}) {
  const baseStyles = convertTailwindToStyle(className);
  return { ...baseStyles, ...additionalStyles };
}

/**
 * Convert image src to require() or URI format
 * @param {string} src - Image source path
 * @param {boolean} isLocal - Whether it's a local asset
 * @returns {string|object} require() statement or URI object
 */
export function convertImageSource(src, isLocal = true) {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return { uri: src };
  }
  
  if (isLocal) {
    // For local assets, you'll need to manually update paths
    // This is a placeholder - actual conversion requires file path mapping
    return require(`../assets/${src.split('/').pop()}`);
  }
  
  return { uri: src };
}

/**
 * Convert onClick to onPress
 * @param {string} propName - Event prop name
 * @returns {string} React Native event prop name
 */
export function convertEventProp(propName) {
  const eventMap = {
    'onClick': 'onPress',
    'onChange': 'onChangeText', // For TextInput
    'onSubmit': 'onSubmitEditing', // For TextInput
    'onFocus': 'onFocus',
    'onBlur': 'onBlur',
  };
  
  return eventMap[propName] || propName;
}

/**
 * Common conversion patterns
 */
export const conversionPatterns = {
  // Replace className with style prop
  classNameToStyle: (className) => {
    return `style={[styles.${className.replace(/\s+/g, '_').replace(/-/g, '_')}]}`;
  },
  
  // Replace div with View
  divToView: (jsx) => {
    return jsx.replace(/<div/g, '<View').replace(/<\/div>/g, '</View>');
  },
  
  // Replace span/p with Text
  textElementsToText: (jsx) => {
    return jsx
      .replace(/<span/g, '<Text')
      .replace(/<\/span>/g, '</Text>')
      .replace(/<p/g, '<Text')
      .replace(/<\/p>/g, '</Text>');
  },
  
  // Replace img with Image
  imgToImage: (jsx) => {
    return jsx
      .replace(/<img\s+/g, '<Image ')
      .replace(/src=/g, 'source=')
      .replace(/alt=/g, '');
  },
  
  // Replace button with TouchableOpacity
  buttonToTouchable: (jsx) => {
    return jsx
      .replace(/<button/g, '<TouchableOpacity')
      .replace(/<\/button>/g, '</TouchableOpacity>')
      .replace(/onClick=/g, 'onPress=');
  },
  
  // Replace a tags with TouchableOpacity
  linkToTouchable: (jsx) => {
    return jsx
      .replace(/<a\s+/g, '<TouchableOpacity ')
      .replace(/<\/a>/g, '</TouchableOpacity>')
      .replace(/href=/g, 'onPress={() => navigation.navigate(')
      .replace(/onClick=/g, 'onPress=');
  },
};

/**
 * Get React Native imports needed for a component
 * @param {Array<string>} components - List of components used
 * @returns {string} Import statement
 */
export function getRequiredImports(components) {
  const baseImports = ['View', 'Text', 'StyleSheet'];
  const allComponents = [...new Set([...baseImports, ...components])];
  
  return `import { ${allComponents.join(', ')} } from 'react-native';`;
}

/**
 * Common React Native component imports
 */
export const commonImports = {
  basic: "import { View, Text, StyleSheet, ScrollView } from 'react-native';",
  interactive: "import { TouchableOpacity, TouchableHighlight, Pressable } from 'react-native';",
  input: "import { TextInput } from 'react-native';",
  image: "import { Image } from 'react-native';",
  navigation: "import { useNavigation } from '@react-navigation/native';",
  storage: "import AsyncStorage from '@react-native-async-storage/async-storage';",
  icons: "import Icon from 'react-native-vector-icons/MaterialIcons';",
  dimensions: "import { Dimensions } from 'react-native';",
  platform: "import { Platform } from 'react-native';",
  alert: "import { Alert } from 'react-native';",
  activity: "import { ActivityIndicator } from 'react-native';",
};

