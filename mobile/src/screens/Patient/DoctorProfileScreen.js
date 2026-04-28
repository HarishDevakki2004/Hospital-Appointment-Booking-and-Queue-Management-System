import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { AppContext } from '../../context/AppContext';
import { getDefaultAvatar } from '../../assets';

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

const DoctorProfileScreen = ({ navigation, route }) => {
  const { doctors, token } = useContext(AppContext);
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (doctors.length > 0) {
      const foundDoctor = doctors.find((d) => d._id === doctorId);
      if (foundDoctor) {
        setDoctor(foundDoctor);
        setLoading(false);
      }
    }
  }, [doctors, doctorId]);

  // Calculate distance and time when both locations are available
  useEffect(() => {
    if (userLocation && doctor?.location?.latitude && doctor?.location?.longitude) {
      calculateDistanceAndTime();
    }
  }, [userLocation, doctor]);

  // Calculate distance using Haversine formula
  const calculateDistanceAndTime = () => {
    if (!userLocation || !doctor?.location) return;

    const R = 6371; // Earth's radius in km
    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = doctor.location.latitude;
    const lon2 = doctor.location.longitude;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Estimate time (assuming average speed of 30 km/h in city)
    const estimatedMinutes = Math.round((distanceKm / 30) * 60);

    setDistance(distanceKm.toFixed(1));
    setEstimatedTime(estimatedMinutes);
  };

  // Get user's current location
  const requestUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get directions. Please enable it in your device settings.'
        );
        setIsLoadingLocation(false);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userLoc);
      return userLoc;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Open Google Maps with directions
  const openGoogleMaps = () => {
    if (!doctor?.location?.latitude || !doctor?.location?.longitude) {
      Alert.alert('Error', 'Doctor location is not available.');
      return;
    }

    const { latitude, longitude } = doctor.location;
    const address = doctor.location.address || 
      (typeof doctor.address === 'object' 
        ? `${doctor.address.line1 || ''} ${doctor.address.line2 || ''}`.trim()
        : doctor.address) ||
      '';

    // Use destination coordinates or address
    const destination = address 
      ? encodeURIComponent(address)
      : `${latitude},${longitude}`;

    let url = '';
    
    if (userLocation) {
      // If we have user location, show directions
      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      if (Platform.OS === 'ios') {
        url = `maps://maps.apple.com/?daddr=${destination}&dirflg=d`;
      } else {
        url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
      }
    } else {
      // Just show the location
      if (Platform.OS === 'ios') {
        url = `maps://maps.apple.com/?q=${destination}`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${destination}`;
      }
    }

    Linking.openURL(url).catch((err) => {
      console.error('Error opening maps:', err);
      Alert.alert('Error', 'Could not open maps. Please install Google Maps or Apple Maps.');
    });
  };

  // Handle Get Direction button press
  const handleGetDirection = async () => {
    if (!doctor?.location?.latitude || !doctor?.location?.longitude) {
      Alert.alert('Error', 'Doctor location is not available.');
      return;
    }

    if (!userLocation) {
      // Request location first
      const location = await requestUserLocation();
      if (location) {
        // Calculate distance and time immediately
        const calculated = calculateDistanceAndTimeForLocation(location);
        if (calculated) {
          showDirectionInfo(calculated.distance, calculated.time);
        } else {
          openGoogleMaps();
        }
      }
    } else {
      showDirectionInfo();
    }
  };

  // Calculate distance and time for a given location
  const calculateDistanceAndTimeForLocation = (userLoc) => {
    if (!userLoc || !doctor?.location) return null;

    const R = 6371; // Earth's radius in km
    const lat1 = userLoc.latitude;
    const lon1 = userLoc.longitude;
    const lat2 = doctor.location.latitude;
    const lon2 = doctor.location.longitude;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Estimate time (assuming average speed of 30 km/h in city)
    const estimatedMinutes = Math.round((distanceKm / 30) * 60);

    return {
      distance: distanceKm.toFixed(1),
      time: estimatedMinutes,
    };
  };

  // Show direction info and open maps
  const showDirectionInfo = (dist = distance, time = estimatedTime) => {
    if (dist && time) {
      Alert.alert(
        'Direction Information',
        `Distance: ${dist} km\nEstimated Time: ${time} minutes`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Maps', onPress: openGoogleMaps },
        ]
      );
    } else {
      openGoogleMaps();
    }
  };

  const handleBookAppointment = () => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to book an appointment');
      return;
    }
    navigation.navigate('BookingSlot', { doctorId });
  };

  if (loading || !doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={doctor.image ? { uri: doctor.image } : getDefaultAvatar()} 
        style={styles.doctorImage} 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.speciality}>{doctor.speciality}</Text>
          </View>
          {doctor.available && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableText}>Available</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{doctor.about}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Degree:</Text>
            <Text style={styles.detailValue}>{doctor.degree}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Experience:</Text>
            <Text style={styles.detailValue}>{doctor.experience} years</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Consultation Fee:</Text>
            <Text style={styles.detailValue}>₹{doctor.fees}</Text>
          </View>
        </View>

        {doctor.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.addressText}>
              {typeof doctor.address === 'object' 
                ? `${doctor.address.line1 || ''} ${doctor.address.line2 || ''}`.trim()
                : doctor.address
              }
            </Text>
            {doctor.location?.latitude && doctor.location?.longitude && (
              <>
                {MapView && Marker ? (
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: doctor.location.latitude,
                        longitude: doctor.location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      showsUserLocation={false}
                      showsMyLocationButton={false}
                    >
                      <Marker
                        coordinate={{
                          latitude: doctor.location.latitude,
                          longitude: doctor.location.longitude,
                        }}
                        title={doctor.name}
                        description={typeof doctor.address === 'object' 
                          ? `${doctor.address.line1 || ''} ${doctor.address.line2 || ''}`.trim()
                          : doctor.address
                        }
                      />
                    </MapView>
                  </View>
                ) : (
                  <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderText}>📍</Text>
                    <Text style={styles.mapPlaceholderLabel}>
                      Location: {doctor.location.latitude.toFixed(4)}, {doctor.location.longitude.toFixed(4)}
                    </Text>
                    <Text style={styles.mapPlaceholderNote}>
                      Map view available in development build
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.directionButton}
                  onPress={handleGetDirection}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.directionButtonText}>📍 Get Direction</Text>
                      {distance && estimatedTime && (
                        <View style={styles.directionInfo}>
                          <Text style={styles.directionInfoText}>
                            {distance} km • {estimatedTime} min
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.bookButton, !doctor.available && styles.bookButtonDisabled]}
          onPress={handleBookAppointment}
          disabled={!doctor.available}
        >
          <Text style={styles.bookButtonText}>
            {doctor.available ? 'Book Appointment' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#e5e7eb',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  doctorName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  speciality: {
    fontSize: 18,
    color: '#6b7280',
  },
  availableBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availableText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  addressText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    height: 250,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 48,
    marginBottom: 12,
  },
  mapPlaceholderLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  mapPlaceholderNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  directionButton: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  directionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  directionInfo: {
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  directionInfoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DoctorProfileScreen;


