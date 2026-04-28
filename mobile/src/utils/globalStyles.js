import { StyleSheet, Platform } from 'react-native';

/**
 * Global Styles for React Native
 * Converted from frontend/src/index.css
 */
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f9fafb',
  },
  
  // Safe area container
  safeContainer: {
    flex: 1,
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },

  // Scrollable content container
  scrollContainer: {
    flex: 1,
    width: '100%',
  },

  // Text styles
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : 'sans-serif',
    fontSize: 14,
    color: '#111827',
  },

  textSmall: {
    fontSize: 12,
  },

  textBase: {
    fontSize: 14,
  },

  textLarge: {
    fontSize: 16,
  },

  textXLarge: {
    fontSize: 18,
  },

  text2XLarge: {
    fontSize: 20,
  },

  text3XLarge: {
    fontSize: 24,
  },

  // Font weights
  fontLight: {
    fontWeight: '300',
  },

  fontNormal: {
    fontWeight: '400',
  },

  fontMedium: {
    fontWeight: '500',
  },

  fontSemibold: {
    fontWeight: '600',
  },

  fontBold: {
    fontWeight: '700',
  },

  // Color utilities
  textPrimary: {
    color: '#3b82f6',
  },

  textSecondary: {
    color: '#6b7280',
  },

  textWhite: {
    color: '#ffffff',
  },

  textGray: {
    color: '#4b5563',
  },

  textGrayDark: {
    color: '#111827',
  },

  // Background colors
  bgWhite: {
    backgroundColor: '#ffffff',
  },

  bgGray: {
    backgroundColor: '#f3f4f6',
  },

  bgGrayLight: {
    backgroundColor: '#f9fafb',
  },

  bgPrimary: {
    backgroundColor: '#3b82f6',
  },

  // Spacing utilities
  p2: {
    padding: 8,
  },

  p4: {
    padding: 16,
  },

  p6: {
    padding: 24,
  },

  px2: {
    paddingHorizontal: 8,
  },

  px4: {
    paddingHorizontal: 16,
  },

  px6: {
    paddingHorizontal: 24,
  },

  py2: {
    paddingVertical: 8,
  },

  py4: {
    paddingVertical: 16,
  },

  py6: {
    paddingVertical: 24,
  },

  m2: {
    margin: 8,
  },

  m4: {
    margin: 16,
  },

  mx2: {
    marginHorizontal: 8,
  },

  mx4: {
    marginHorizontal: 16,
  },

  my2: {
    marginVertical: 8,
  },

  my4: {
    marginVertical: 16,
  },

  // Border radius
  rounded: {
    borderRadius: 4,
  },

  roundedMd: {
    borderRadius: 6,
  },

  roundedLg: {
    borderRadius: 8,
  },

  roundedXl: {
    borderRadius: 12,
  },

  rounded2Xl: {
    borderRadius: 16,
  },

  roundedFull: {
    borderRadius: 9999,
  },

  // Flex utilities
  flexRow: {
    flexDirection: 'row',
  },

  flexCol: {
    flexDirection: 'column',
  },

  itemsCenter: {
    alignItems: 'center',
  },

  itemsStart: {
    alignItems: 'flex-start',
  },

  itemsEnd: {
    alignItems: 'flex-end',
  },

  justifyCenter: {
    justifyContent: 'center',
  },

  justifyBetween: {
    justifyContent: 'space-between',
  },

  justifyAround: {
    justifyContent: 'space-around',
  },

  justifyStart: {
    justifyContent: 'flex-start',
  },

  justifyEnd: {
    justifyContent: 'flex-end',
  },

  // Width/Height utilities
  wFull: {
    width: '100%',
  },

  hFull: {
    height: '100%',
  },

  // Shadow utilities (for elevation)
  shadowSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  shadowMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  // Border utilities
  border: {
    borderWidth: 1,
  },

  borderGray: {
    borderColor: '#e5e7eb',
  },

  borderGrayDark: {
    borderColor: '#d1d5db',
  },

  // Common component styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    ...StyleSheet.absoluteFillObject.shadowMd,
  },

  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },

  // Bottom navigation safe area
  bottomNavSafeArea: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
});

// Animation values (React Native uses Animated API, not CSS animations)
export const animations = {
  fadeIn: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  fadeInInitial: {
    opacity: 0,
    transform: [{ translateY: 10 }],
  },
};

// Platform-specific styles
export const platformStyles = StyleSheet.create({
  // iOS specific
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Android specific
  androidElevation: {
    elevation: 4,
  },
});

