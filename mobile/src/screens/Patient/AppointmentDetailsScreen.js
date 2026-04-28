import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import { getDefaultAvatar } from '../../assets';

const AppointmentDetailsScreen = ({ route, navigation }) => {
  const { token } = useContext(AppContext);
  const { appointment: initialAppointment } = route.params || {};
  const [appointment, setAppointment] = useState(initialAppointment);
  const [loading, setLoading] = useState(!initialAppointment);

  useEffect(() => {
    if (!initialAppointment && route.params?.appointmentId) {
      fetchAppointmentDetails(route.params.appointmentId);
    }
  }, [route.params]);

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE}/api/user/appointments/${appointmentId}`,
        { headers: { token } }
      );

      if (data.success) {
        setAppointment(data.appointment);
      } else {
        Alert.alert('Error', data.message || 'Failed to load appointment details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      Alert.alert('Error', 'Failed to load appointment details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'in_progress':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const handleCallHospital = () => {
    const phone = appointment?.hospital?.phone;
    if (!phone) {
      Alert.alert('No Phone Number', 'Phone number not available for this hospital.');
      return;
    }

    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleViewPrescription = () => {
    const url = appointment?.prescriptionUrl;
    if (!url) {
      Alert.alert('No Prescription', 'Prescription not available for this appointment.');
      return;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open prescription');
    });
  };

  const handleDownloadInvoice = () => {
    const url = appointment?.invoiceUrl;
    if (!url) {
      Alert.alert('No Invoice', 'Invoice not available for this appointment.');
      return;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to download invoice');
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading appointment details...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Appointment not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={
            appointment.doctorImage
              ? { uri: appointment.doctorImage }
              : getDefaultAvatar()
          }
          style={styles.doctorImage}
          defaultSource={getDefaultAvatar()}
        />
        <Text style={styles.doctorName}>{appointment.doctorName}</Text>
        <Text style={styles.specialization}>{appointment.specialization}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(appointment.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(appointment.status) }]}
          >
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Token Number:</Text>
          <Text style={styles.detailValue}>{appointment.tokenNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{formatDate(appointment.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>
            {appointment.timeFormatted || formatTime(appointment.time)}
          </Text>
        </View>
        {appointment.amount > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>
              ₹{appointment.amount} {appointment.payment ? '✓ Paid' : 'Pending'}
            </Text>
          </View>
        )}
      </View>

      {/* Hospital Information */}
      {appointment.hospital && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hospital Information</Text>
          {appointment.hospital.name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{appointment.hospital.name}</Text>
            </View>
          )}
          {appointment.hospital.address && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>{appointment.hospital.address}</Text>
            </View>
          )}
          {appointment.hospital.phone && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCallHospital}
              accessibilityLabel="Call hospital"
              accessibilityRole="button"
            >
              <Text style={styles.actionButtonText}>📞 Call Hospital</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Notes */}
      {appointment.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        {appointment.prescriptionUrl && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewPrescription}
            accessibilityLabel="View prescription"
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>📄 View Prescription</Text>
          </TouchableOpacity>
        )}
        {appointment.invoiceUrl && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownloadInvoice}
            accessibilityLabel="Download invoice"
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>📥 Download Invoice</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 100,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppointmentDetailsScreen;

