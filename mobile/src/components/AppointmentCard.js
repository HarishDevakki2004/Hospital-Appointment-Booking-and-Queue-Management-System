import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { getDefaultAvatar } from '../assets';
import * as Location from 'expo-location';
import { calculateETA } from '../utils/etaCalculator';
import { API_BASE } from '../config';

const AppointmentCard = ({
  appointment,
  onQueueInfo,
  onMakePayment,
  onCancel,
  onLocationPress,
  token,
}) => {
  const {
    _id: appointmentId,
    docData,
    slotTokenIndex,
    tokenNumber,
    slotDate,
    slotTime,
    slotPeriod,
    status,
    payment,
    amount,
    estimatedStart,
  } = appointment;

  const displayToken = slotTokenIndex || tokenNumber || 'N/A';
  const tokenString = appointment.tokenNumber || `A-${displayToken}`;
  const isBooked = status === 'BOOKED' || (!status && !appointment.cancelled);
  const isPaid = payment === true || status === 'PAID';
  const isCancelled = appointment.cancelled || status === 'CANCELLED';
  const isCompleted = appointment.isCompleted || status === 'COMPLETED';
  const paymentRequired = amount && amount > 0;
  const needsPayment = paymentRequired && !isPaid && isBooked;

  const [eta, setEta] = useState(null);
  const [etaLoading, setEtaLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const doctorLocation = docData?.location;
  const hasDoctorLocation = doctorLocation && (doctorLocation.lat || doctorLocation.latitude) && (doctorLocation.lng || doctorLocation.longitude);

  // Request location permission and fetch ETA
  useEffect(() => {
    if (hasDoctorLocation && isBooked && !isCancelled && !isCompleted) {
      requestLocationAndCalculateETA();
    }
  }, [appointmentId, hasDoctorLocation, isBooked]);

  const requestLocationAndCalculateETA = async () => {
    try {
      // Check permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        setLocationPermission('denied');
        return;
      }

      setLocationPermission('granted');
      setEtaLoading(true);

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 8000,
      });

      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;
      setUserLocation({ lat: userLat, lng: userLng });

      // Get doctor coordinates
      const doctorLat = doctorLocation.lat || doctorLocation.latitude;
      const doctorLng = doctorLocation.lng || doctorLocation.longitude;

      // Calculate ETA
      const etaResult = await calculateETA({
        fromLat: userLat,
        fromLng: userLng,
        toLat: doctorLat,
        toLng: doctorLng,
        mode: 'driving',
        apiBase: API_BASE,
        token,
      });

      setEta(etaResult);

      // Emit telemetry
      if (etaResult.available) {
        console.log('eta_fetched', {
          appointmentId,
          method: etaResult.method,
          durationMin: etaResult.durationMin,
        });
      }
    } catch (error) {
      console.error('Error calculating ETA:', error);
      setEta({ available: false });
      setLocationPermission('error');
    } finally {
      setEtaLoading(false);
    }
  };

  const handleLocationPress = async () => {
    if (!hasDoctorLocation) {
      return;
    }

    const doctorLat = doctorLocation.lat || doctorLocation.latitude;
    const doctorLng = doctorLocation.lng || doctorLocation.longitude;
    const doctorName = docData?.name || 'Doctor';
    const address = docData?.address || '';

    // Try external maps first
    let opened = false;

    // Try Android geo intent
    try {
      const geoUrl = `geo:${doctorLat},${doctorLng}?q=${doctorLat},${doctorLng}(${encodeURIComponent(doctorName)})`;
      const canOpen = await Linking.canOpenURL(geoUrl);
      if (canOpen) {
        await Linking.openURL(geoUrl);
        opened = true;
        console.log('map_opened', { appointmentId, doctorId: docData?.id, method: 'external' });
      }
    } catch (error) {
      // Continue to next method
    }

    // Try Google Maps
    if (!opened) {
      try {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${doctorLat},${doctorLng}&travelmode=driving`;
        const canOpen = await Linking.canOpenURL(googleMapsUrl);
        if (canOpen) {
          await Linking.openURL(googleMapsUrl);
          opened = true;
          console.log('map_opened', { appointmentId, doctorId: docData?.id, method: 'external' });
        }
      } catch (error) {
        // Continue to next method
      }
    }

    // Try Apple Maps
    if (!opened) {
      try {
        const appleMapsUrl = `http://maps.apple.com/?daddr=${doctorLat},${doctorLng}`;
        const canOpen = await Linking.canOpenURL(appleMapsUrl);
        if (canOpen) {
          await Linking.openURL(appleMapsUrl);
          opened = true;
          console.log('map_opened', { appointmentId, doctorId: docData?.id, method: 'external' });
        }
      } catch (error) {
        // Continue to fallback
      }
    }

    // Fallback: Open in-app map modal
    if (!opened && onLocationPress) {
      onLocationPress(appointment);
      console.log('map_opened', { appointmentId, doctorId: docData?.id, method: 'in-app' });
    }
  };

  const handleEnableLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await requestLocationAndCalculateETA();
      } else {
        // Open app settings
        Linking.openSettings();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM format
  };

  const renderETADisplay = () => {
    if (!hasDoctorLocation) {
      return (
        <View style={styles.etaContainer}>
          <Text style={styles.etaTextDisabled}>Location not available</Text>
        </View>
      );
    }

    if (locationPermission === 'denied') {
      return (
        <TouchableOpacity
          style={styles.etaContainer}
          onPress={handleEnableLocation}
          accessibilityLabel="Enable location for ETA"
          accessibilityRole="button"
        >
          <Text style={styles.etaLinkText}>Enable location for ETA</Text>
        </TouchableOpacity>
      );
    }

    if (etaLoading) {
      return (
        <View style={styles.etaContainer}>
          <ActivityIndicator size="small" color="#6b7280" />
        </View>
      );
    }

    if (eta && eta.available) {
      return (
        <View style={styles.etaContainer}>
          <Text style={styles.etaText}>
            ETA: {eta.durationMin} min
            {eta.distanceKm && ` (${eta.distanceKm} km)`}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.etaContainer}>
        <Text style={styles.etaTextDisabled}>ETA: Not available</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.card,
        (isCancelled || isCompleted) && styles.cardInactive,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Appointment with ${docData?.name || 'doctor'}, token ${tokenString}`}
    >
      <View style={styles.cardContent}>
        {/* Left: Doctor Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={
              docData?.image
                ? { uri: docData.image }
                : getDefaultAvatar()
            }
            style={styles.doctorPhoto}
            defaultSource={getDefaultAvatar()}
            accessibilityLabel={`${docData?.name || 'Doctor'} profile picture`}
          />
        </View>

        {/* Middle: Doctor Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {docData?.name || 'Unknown Doctor'}
          </Text>
          <Text style={styles.specialization} numberOfLines={1}>
            {docData?.speciality || 'General Physician'}
          </Text>

          <View style={styles.tokenContainer}>
            <Text style={styles.tokenLabel}>Token:</Text>
            <Text style={styles.tokenNumber}>#{displayToken}</Text>
          </View>

          <View style={styles.dateTimeContainer}>
            {slotDate && (
              <Text style={styles.dateTimeText}>
                {formatDate(slotDate)}
              </Text>
            )}
            {slotTime && (
              <Text style={styles.dateTimeText}>
                {formatTime(slotTime)} {slotPeriod || ''}
              </Text>
            )}
          </View>
        </View>

        {/* Right: Location Icon and ETA */}
        <View style={styles.locationContainer}>
          {hasDoctorLocation ? (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleLocationPress}
              accessibilityLabel={`Open map for ${docData?.name || 'doctor'}`}
              accessibilityHint="Opens map to show doctor location and directions"
              accessibilityRole="button"
            >
              <Text style={styles.locationIcon}>📍</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.locationButton, styles.locationButtonDisabled]}>
              <Text style={[styles.locationIcon, styles.locationIconDisabled]}>📍</Text>
            </View>
          )}
          {renderETADisplay()}
        </View>
      </View>

      {/* Bottom: Action Buttons */}
      {isBooked && !isCancelled && !isCompleted && (
        <View style={styles.actionsContainer}>
          {/* Queue Info Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.queueInfoButton]}
            onPress={() => onQueueInfo && onQueueInfo(appointment)}
            accessibilityLabel="View queue information"
            accessibilityHint="Shows your position in the queue and estimated wait time"
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>Queue Info</Text>
          </TouchableOpacity>

          {/* Make Payment Button */}
          {needsPayment ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.paymentButton]}
              onPress={() => onMakePayment && onMakePayment(appointment)}
              accessibilityLabel="Make payment for appointment"
              accessibilityHint={`Pay ₹${amount || 0} for this appointment`}
              accessibilityRole="button"
            >
              <Text style={styles.actionButtonText}>Make Payment</Text>
            </TouchableOpacity>
          ) : isPaid ? (
            <View
              style={[styles.actionButton, styles.paidBadge]}
              accessibilityLabel="Payment completed"
            >
              <Text style={styles.paidBadgeText}>✓ Paid</Text>
            </View>
          ) : null}

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancel && onCancel(appointment)}
            accessibilityLabel="Cancel appointment"
            accessibilityHint="Cancels this appointment"
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View for cancelled/completed */}
      {(isCancelled || isCompleted) && (
        <View style={styles.actionsContainer}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {isCancelled ? 'Cancelled' : 'Completed'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  photoContainer: {
    marginRight: 12,
  },
  doctorPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e5e7eb',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    minWidth: 0, // Allows text to wrap
  },
  doctorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tokenLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 4,
  },
  tokenNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
  dateTimeContainer: {
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  locationContainer: {
    alignItems: 'center',
    marginLeft: 8,
    minWidth: 60,
  },
  locationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    marginBottom: 4,
  },
  locationButtonDisabled: {
    backgroundColor: '#f9fafb',
    opacity: 0.5,
  },
  locationIcon: {
    fontSize: 20,
  },
  locationIconDisabled: {
    opacity: 0.5,
  },
  etaContainer: {
    alignItems: 'center',
    minHeight: 20,
    justifyContent: 'center',
  },
  etaText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  etaTextDisabled: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  etaLinkText: {
    fontSize: 10,
    color: '#3b82f6',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Accessibility: minimum touch target
  },
  queueInfoButton: {
    backgroundColor: '#3b82f6',
  },
  paymentButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#ffffff',
  },
  paidBadge: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  paidBadgeText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
});

export default AppointmentCard;
