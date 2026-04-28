import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import RazorpayPaymentModal from '../../components/RazorpayPaymentModal';

const BookingSlotScreen = ({ navigation, route }) => {
  const { doctorId } = route.params;
  const { token } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate && doctorId) {
      fetchSlots();
    }
  }, [selectedDate, doctorId]);

  // SAME LOGIC AS WEB - Get slots for date
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/availability/slots/${doctorId}?date=${selectedDate}`
      );

      if (data.success) {
        // Show all slots - don't filter by available tokens
        // The backend already creates tokens for each slot
        const allSlots = data.slots || [];
        setSlots(allSlots);
        
        // Check if any slots have available tokens
        const slotsWithAvailability = allSlots.filter(slot => 
          slot.tokens && slot.tokens.some(token => token.status === 'AVAILABLE')
        );
        
        if (allSlots.length > 0 && slotsWithAvailability.length === 0) {
          // Slots exist but all are booked
          console.log('All slots are fully booked');
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to load slots');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      Alert.alert('Error', 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  // SAME LOGIC AS WEB - Book token
  const handleBookToken = async (slotId, tokenIndex) => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to book an appointment');
      return;
    }

    setBooking(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/booking/book-slot-token`,
        {
          slotId,
          travelTime: 15, // Default, can be calculated with maps
        },
        { headers: { token } }
      );

      if (data.success) {
        // Create full appointment object with all necessary fields
        const appointmentData = {
          ...data.appointment,
          _id: data.appointment._id || data.appointmentId || data.appointment.appointmentId,
          docData: data.appointment.docData || {},
          slotDate: data.appointment.slotDate,
          slotTime: data.appointment.slotTime,
          slotPeriod: data.appointment.slotPeriod,
          amount: data.appointment.amount || 0,
        };
        
        setBookedAppointment(appointmentData);
        const estimatedTime = data.appointment.estimatedTime || 'N/A';
        
        // Show success alert
        Alert.alert(
          'Success',
          `Appointment booked successfully!\n\nToken #${data.appointment.slotTokenIndex}\nEstimated time for your turn: ${estimatedTime}`,
          [
            {
              text: 'OK',
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Time Slot</Text>
        <Text style={styles.subtitle}>Choose a date and time slot</Text>
      </View>

      {/* Date Picker */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Select Date</Text>
        <TextInput
          style={styles.dateInput}
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : slots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No available slots for this date</Text>
          <Text style={styles.emptySubtext}>Please try selecting another date</Text>
        </View>
      ) : (
        <View style={styles.slotsContainer}>
          {slots.map((slot) => (
            <View key={slot._id} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <Text style={styles.slotPeriod}>{slot.slotPeriod}</Text>
                <Text style={styles.slotTime}>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </Text>
              </View>

              <Text style={styles.slotInfo}>
                {slot.totalTokens} / {slot.capacity || '∞'} tokens booked
              </Text>

              {/* Token Chips */}
              <View style={styles.tokensContainer}>
                {slot.tokens && slot.tokens.length > 0 ? (
                  slot.tokens.slice(0, 10).map((token) => (
                    <TouchableOpacity
                      key={token.index}
                      style={[
                        styles.tokenChip,
                        token.status === 'AVAILABLE' && styles.tokenAvailable,
                        token.status === 'BOOKED' && styles.tokenBooked,
                        token.status === 'COMPLETED' && styles.tokenCompleted,
                        token.status === 'IN_PROGRESS' && styles.tokenInProgress,
                      ]}
                      onPress={() => {
                        if (token.status === 'AVAILABLE') {
                          handleBookToken(slot._id, token.index);
                        }
                      }}
                      disabled={token.status !== 'AVAILABLE' || booking}
                    >
                      <Text
                        style={[
                          styles.tokenText,
                          token.status === 'AVAILABLE' && styles.tokenTextAvailable,
                          token.status === 'BOOKED' && styles.tokenTextBooked,
                        ]}
                      >
                        {token.index}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noTokensText}>No tokens available</Text>
                )}
              </View>

              {slot.tokens && slot.tokens.length > 10 && (
                <Text style={styles.moreTokens}>+{slot.tokens.length - 10} more</Text>
              )}

              {/* Booking Success Message */}
              {bookedAppointment && (
                <View style={styles.successCard}>
                  <Text style={styles.successIcon}>✅</Text>
                  <Text style={styles.successTitle}>Appointment Booked Successfully!</Text>
                  <Text style={styles.tokenNumber}>Token #{bookedAppointment.slotTokenIndex}</Text>
                  <Text style={styles.estimatedTime}>
                    Estimated time for your turn: <Text style={styles.estimatedTimeValue}>{bookedAppointment.estimatedTime || 'N/A'}</Text>
                  </Text>
                  <Text style={styles.estimatedTimeNote}>
                    (Based on {bookedAppointment.averageConsultationTime || 10} min per patient)
                  </Text>
                  {bookedAppointment.amount > 0 && (
                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() => {
                        // Open Razorpay payment modal
                        // Ensure appointment has _id for payment
                        const paymentAppt = {
                          ...bookedAppointment,
                          _id: bookedAppointment._id || bookedAppointment.appointmentId || bookedAppointment.id,
                          amount: bookedAppointment.amount || 0,
                        };
                        
                        if (!paymentAppt._id) {
                          Alert.alert('Error', 'Appointment ID is missing. Please try again.');
                          return;
                        }
                        
                        setPaymentAppointment(paymentAppt);
                        setShowPaymentModal(true);
                      }}
                      accessibilityLabel="Pay online for this appointment"
                      accessibilityRole="button"
                    >
                      <Text style={styles.payButtonText}>
                        💳 Pay Online (₹{bookedAppointment.amount || 0})
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      setBookedAppointment(null);
                      // Navigate to Appointments tab using CommonActions
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [
                            {
                              name: 'PatientTabs',
                              state: {
                                routes: [
                                  { name: 'Home' },
                                  { name: 'Doctors' },
                                  { name: 'Appointments' },
                                  { name: 'Profile' },
                                ],
                                index: 2, // Appointments is at index 2
                              },
                            },
                          ],
                        })
                      );
                    }}
                    accessibilityLabel="View all appointments"
                    accessibilityRole="button"
                  >
                    <Text style={styles.viewButtonText}>View Appointments</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Razorpay Payment Modal */}
      <RazorpayPaymentModal
        visible={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentAppointment(null);
        }}
        appointment={paymentAppointment}
        token={token}
        onSuccess={() => {
          setShowPaymentModal(false);
          setPaymentAppointment(null);
          setBookedAppointment(null);
          // Refresh slots to show updated booking status
          fetchSlots();
          // Navigate to Appointments tab using CommonActions
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'PatientTabs',
                  state: {
                    routes: [
                      { name: 'Home' },
                      { name: 'Doctors' },
                      { name: 'Appointments' },
                      { name: 'Profile' },
                    ],
                    index: 2, // Appointments is at index 2
                  },
                },
              ],
            })
          );
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#dbeafe',
  },
  dateContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  slotsContainer: {
    padding: 16,
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotPeriod: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  slotTime: {
    fontSize: 16,
    color: '#6b7280',
  },
  slotInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  tokensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tokenChip: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenAvailable: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  tokenBooked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tokenCompleted: {
    backgroundColor: '#9ca3af',
    borderColor: '#9ca3af',
  },
  tokenInProgress: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  tokenText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  tokenTextAvailable: {
    color: '#065f46',
  },
  tokenTextBooked: {
    color: '#fff',
  },
  noTokensText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  moreTokens: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  successCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
    textAlign: 'center',
  },
  tokenNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  estimatedTimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  estimatedTimeNote: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  payButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewButton: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookingSlotScreen;

