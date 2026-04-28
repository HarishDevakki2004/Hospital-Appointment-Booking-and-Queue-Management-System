#!/usr/bin/env node

/**
 * Component Conversion Helper Script
 * 
 * This script helps convert Vite React web components to React Native
 * 
 * Usage:
 *   node convert-component.js <source-file> [output-file]
 * 
 * Example:
 *   node convert-component.js ../frontend/src/pages/Home.jsx src/screens/Patient/PatientHomeScreen.js
 */

const fs = require('fs');
const path = require('path');

// Read the source file
const sourceFile = process.argv[2];
const outputFile = process.argv[3];

if (!sourceFile) {
  console.error('Usage: node convert-component.js <source-file> [output-file]');
  process.exit(1);
}

if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Source file not found: ${sourceFile}`);
  process.exit(1);
}

console.log(`Reading: ${sourceFile}`);
const sourceCode = fs.readFileSync(sourceFile, 'utf8');

// Basic conversions (this is a helper - manual review is still needed)
let converted = sourceCode;

// 1. Replace imports
converted = converted.replace(
  /import\s+.*from\s+['"]react-router-dom['"]/g,
  "import { useNavigation } from '@react-navigation/native'"
);

converted = converted.replace(
  /import\s+.*from\s+['"]react-toastify['"]/g,
  "import { Alert } from 'react-native'"
);

// 2. Add React Native imports if not present
if (!converted.includes("from 'react-native'")) {
  const reactNativeImports = "import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';\n";
  const lastImportIndex = converted.lastIndexOf("import");
  if (lastImportIndex !== -1) {
    const nextLineIndex = converted.indexOf('\n', lastImportIndex);
    converted = converted.slice(0, nextLineIndex + 1) + reactNativeImports + converted.slice(nextLineIndex + 1);
  } else {
    converted = reactNativeImports + converted;
  }
}

// 3. Replace localStorage with AsyncStorage
converted = converted.replace(/localStorage\./g, 'await AsyncStorage.');
if (converted.includes('AsyncStorage') && !converted.includes("from '@react-native-async-storage/async-storage'")) {
  converted = "import AsyncStorage from '@react-native-async-storage/async-storage';\n" + converted;
}

// 4. Replace useNavigate
converted = converted.replace(
  /const\s+navigate\s*=\s*useNavigate\(\)/g,
  'const navigation = useNavigation()'
);

// 5. Replace navigate() calls
converted = converted.replace(/navigate\(['"]([^'"]+)['"]\)/g, "navigation.navigate('$1')");

// 6. Replace toast with Alert
converted = converted.replace(/toast\.(success|error|info|warning)\(['"]([^'"]+)['"]\)/g, "Alert.alert('$1', '$2')");

// 7. Basic HTML to React Native (simple cases)
converted = converted.replace(/<div\s+/g, '<View ');
converted = converted.replace(/<\/div>/g, '</View>');
converted = converted.replace(/<span\s+/g, '<Text ');
converted = converted.replace(/<\/span>/g, '</Text>');
converted = converted.replace(/<p\s+/g, '<Text ');
converted = converted.replace(/<\/p>/g, '</Text>');
converted = converted.replace(/<button\s+/g, '<TouchableOpacity ');
converted = converted.replace(/<\/button>/g, '</TouchableOpacity>');
converted = converted.replace(/onClick=/g, 'onPress=');
converted = converted.replace(/<img\s+/g, '<Image ');
converted = converted.replace(/src=/g, 'source=');
converted = converted.replace(/alt="[^"]*"/g, '');

// 8. Remove className and add style placeholder
converted = converted.replace(/className="([^"]+)"/g, 'style={styles.$1}');

// 9. Replace event.preventDefault() - remove or handle differently
converted = converted.replace(/event\.preventDefault\(\);/g, '// Prevent default handled by React Native');

// 10. Add navigation prop to component if it uses navigation
if (converted.includes('navigation.navigate') || converted.includes('useNavigation')) {
  converted = converted.replace(
    /const\s+(\w+)\s*=\s*\(\)\s*=>/g,
    'const $1 = ({ navigation }) =>'
  );
}

// 11. Wrap content in ScrollView if it's a page component
if (sourceFile.includes('pages/') || sourceFile.includes('Page')) {
  // This is a heuristic - manual review needed
  if (!converted.includes('ScrollView') && converted.includes('return (')) {
    converted = converted.replace(
      /return\s*\(\s*<View/g,
      'return (\n    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>\n      <View'
    );
    // Close ScrollView before closing return
    // This is complex and may need manual adjustment
  }
}

// Output the converted code
if (outputFile) {
  // Ensure directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, converted, 'utf8');
  console.log(`\n✅ Converted file written to: ${outputFile}`);
  console.log('\n⚠️  IMPORTANT: Please review and manually adjust the converted code:');
  console.log('   - Check all className to style conversions');
  console.log('   - Verify all images use require() or { uri: ... }');
  console.log('   - Ensure all text is wrapped in <Text> components');
  console.log('   - Add StyleSheet.create() with proper styles');
  console.log('   - Test navigation routes match your AppNavigator');
  console.log('   - Remove any DOM-specific code (document, window)');
} else {
  console.log('\n=== CONVERTED CODE ===\n');
  console.log(converted);
  console.log('\n=== END ===');
  console.log('\n⚠️  This is a basic conversion. Manual review and adjustments are required.');
}

