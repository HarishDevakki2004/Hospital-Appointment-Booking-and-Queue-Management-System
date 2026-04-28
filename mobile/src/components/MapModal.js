import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';

// Conditionally import MapView (only works in development builds, not Expo Go)
let MapView = null;
let Marker = null;
try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
} catch (error) {
  console.log('react-native-maps not available (likely Expo Go)');
}

const MapModal = ({ visible, onClose, location, doctorName, address }) => {
  if (!location || (!location.lat && !location.latitude)) {
    return null;
  }

  const lat = location.lat || location.latitude;
  const lng = location.lng || location.longitude;

  const handleOpenExternalMaps = async () => {
    let opened = false;

    // Try Android geo intent
    try {
      const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(doctorName || 'Doctor')})`;
      const canOpen = await Linking.canOpenURL(geoUrl);
      if (canOpen) {
        await Linking.openURL(geoUrl);
        opened = true;
      }
    } catch (error) {
      // Continue to next method
    }

    // Try Google Maps
    if (!opened) {
      try {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        const canOpen = await Linking.canOpenURL(googleMapsUrl);
        if (canOpen) {
          await Linking.openURL(googleMapsUrl);
          opened = true;
        }
      } catch (error) {
        // Continue to next method
      }
    }

    // Try Apple Maps
    if (!opened) {
      try {
        const appleMapsUrl = `http://maps.apple.com/?daddr=${lat},${lng}`;
        const canOpen = await Linking.canOpenURL(appleMapsUrl);
        if (canOpen) {
          await Linking.openURL(appleMapsUrl);
          opened = true;
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to open maps application');
      }
    }
  };

  const handleShareLocation = async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL(`maps://maps.apple.com/?q=${lat},${lng}`);
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share location');
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    
    try {
      // Use Clipboard from @react-native-clipboard/clipboard if available
      // Otherwise, show alert with address
      const Clipboard = require('@react-native-clipboard/clipboard').default;
      Clipboard.setString(address);
      Alert.alert('Copied', 'Address copied to clipboard');
    } catch (error) {
      // Fallback: show address in alert
      Alert.alert('Address', address);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Location</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {MapView && Marker ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={{
                latitude: lat,
                longitude: lng,
              }}
              title={doctorName || 'Doctor Location'}
              description={address || ''}
            />
          </MapView>
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.fallbackText}>📍</Text>
            <Text style={styles.fallbackTitle}>{doctorName || 'Doctor Location'}</Text>
            <Text style={styles.fallbackAddress}>{address || `Lat: ${lat}, Lng: ${lng}`}</Text>
            <Text style={styles.fallbackNote}>
              Map view not available in Expo Go.{'\n'}Use "Get Directions" to open in external maps.
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <ScrollView style={styles.footerContent}>
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Address:</Text>
              <Text style={styles.addressText}>{address || 'Location not specified'}</Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOpenExternalMaps}
                accessibilityLabel="Get directions"
                accessibilityRole="button"
              >
                <Text style={styles.actionButtonText}>📍 Get Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={handleShareLocation}
                accessibilityLabel="Share location"
                accessibilityRole="button"
              >
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                  📤 Share Location
                </Text>
              </TouchableOpacity>

              {address && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleCopyAddress}
                  accessibilityLabel="Copy address"
                  accessibilityRole="button"
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                    📋 Copy Address
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  footer: {
    maxHeight: 200,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerContent: {
    padding: 16,
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f9fafb',
  },
  fallbackText: {
    fontSize: 64,
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MapModal;
