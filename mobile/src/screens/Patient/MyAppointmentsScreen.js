import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import AppointmentCard from '../../components/AppointmentCard';
import QueueInfoScreen from '../../components/QueueInfoScreen';
import MapModal from '../../components/MapModal';
import RazorpayPaymentModal from '../../components/RazorpayPaymentModal';
import io from 'socket.io-client';

const FILTERS = {
  ALL: 'all',
  UPCOMING: 'upcoming',
  PAST: 'past',
  CANCELLED: 'cancelled',
};

const MyAppointmentsScreen = ({ navigation }) => {
  const { token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showQueueInfo, setShowQueueInfo] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [mapDoctorName, setMapDoctorName] = useState('');
  const [mapAddress, setMapAddress] = useState('');
  const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentAppointment, setSelectedPaymentAppointment] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchAppointments();
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [token]);

  // Connect to WebSocket for real-time queue updates
  const connectWebSocket = () => {
    if (!token) return;

    try {
      socketRef.current = io(API_BASE.replace('/api', ''), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('Appointments WebSocket connected');
      });

      socketRef.current.on('queue_update', (data) => {
        // Update appointments list when queue updates are received
        if (data.type === 'queue_update' && data.appointmentId) {
          handleQueueUpdate(data);
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Appointments WebSocket disconnected');
      });
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const handleQueueUpdate = (data) => {
    // Update the appointment in the list with new queue data
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt._id === data.appointmentId || 
            (data.affectedAppointmentIds && data.affectedAppointmentIds.includes(apt._id))) {
          // Recalculate position if needed
          const yourToken = apt.slotTokenIndex || apt.tokenNumber;
          const currentToken = data.currentToken || 0;
          const isBeingServed = data.servingAppointmentId === apt._id;
          const position = isBeingServed ? 0 : Math.max(0, (yourToken || 0) - currentToken);
          
          return {
            ...apt,
            queuePosition: data.positionInQueue ?? position,
            estimatedWaitMin: data.estimatedWaitMin,
            currentToken: data.currentToken,
            servingAppointmentId: data.servingAppointmentId,
            averageServiceTimePerPatient: data.averageServiceTimePerPatient,
            lastUpdatedAt: data.lastUpdatedAt,
          };
        }
        return apt;
      })
    );

    // If Queue Info is open for this appointment, it will be updated via its own WebSocket connection
    console.log('queue_update_received in appointments list', {
      appointmentId: data.appointmentId,
      position: data.positionInQueue,
      servingAppointmentId: data.servingAppointmentId
    });
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(API_BASE + '/api/booking/my-appointments', {
        headers: { token },
      });

      if (data.success) {
        // Sort: upcoming first, then by date
        const sorted = data.appointments.sort((a, b) => {
          const dateA = new Date(a.slotDate || a.estimatedStart || 0);
          const dateB = new Date(b.slotDate || b.estimatedStart || 0);
          return dateA - dateB;
        });
        setAppointments(sorted);
      } else {
        // Fallback to legacy endpoint
        try {
          const { data: legacyData } = await axios.get(API_BASE + '/api/user/appointments', {
            headers: { token },
          });
          const sorted = legacyData.appointments.sort((a, b) => {
            const dateA = new Date(a.slotDate || 0);
            const dateB = new Date(b.slotDate || 0);
            return dateA - dateB;
          });
          setAppointments(sorted);
        } catch (err) {
          Alert.alert('Error', 'Failed to load appointments');
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.slotDate || appointment.estimatedStart || 0);
      const isCancelled = appointment.cancelled || appointment.status === 'CANCELLED';
      const isPast = appointmentDate < now;
      const isUpcoming = appointmentDate >= now && !isCancelled;

      switch (activeFilter) {
        case FILTERS.UPCOMING:
          return isUpcoming;
        case FILTERS.PAST:
          return isPast && !isCancelled;
        case FILTERS.CANCELLED:
          return isCancelled;
        default:
          return true;
      }
    }).sort((a, b) => {
      // Sort by date: upcoming first
      const dateA = new Date(a.slotDate || a.estimatedStart || 0);
      const dateB = new Date(b.slotDate || b.estimatedStart || 0);
      return dateA - dateB;
    });
  }, [appointments, activeFilter]);

  const handleQueueInfo = (appointment) => {
    setSelectedAppointment(appointment);
    setShowQueueInfo(true);
  };

  const handleLocationPress = (appointment) => {
    const location = appointment.docData?.location || {
      lat: null,
      lng: null,
    };
    const address = appointment.docData?.address || '';

    if (location.lat && location.lng) {
      setMapLocation(location);
      setMapDoctorName(appointment.docData?.name || 'Doctor');
      setMapAddress(address);
      setShowMap(true);
    } else if (address) {
      // Fallback: open maps with address
      const encodedAddress = encodeURIComponent(address);
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(mapUrl).catch(() => {
        Alert.alert('Error', 'Unable to open maps');
      });
    } else {
      Alert.alert('No Location', 'Location information not available for this doctor.');
    }
  };

  const handleMakePayment = async (appointment) => {
    if (isProcessingPayment) {
      return; // Prevent duplicate taps
    }

    try {
      setIsProcessingPayment(true);
      setSelectedPaymentAppointment(appointment);
      setShowPaymentModal(true);
    } catch (error) {
      Alert.alert('Error', 'Unable to initialize payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh appointments list
    fetchAppointments();
    setShowPaymentModal(false);
    setSelectedPaymentAppointment(null);
  };

  const handleCancel = async (appointment) => {
    const appointmentDate = new Date(appointment.slotDate || appointment.estimatedStart);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      Alert.alert(
        'Cannot Cancel',
        'Appointments cannot be cancelled within 2 hours of the scheduled time.'
      );
      return;
    }

    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment with ${appointment.docData?.name || 'the doctor'}?\n\nDate: ${formatDate(appointment.slotDate)}\nToken: #${appointment.slotTokenIndex || appointment.tokenNumber || 'N/A'}\n\nThis action cannot be undone.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data } = await axios.post(
                API_BASE + '/api/user/cancel-appointment',
                { appointmentId: appointment._id },
                { headers: { token } }
              );

              if (data.success) {
                Alert.alert('Success', 'Appointment cancelled successfully');
                fetchAppointments();
              } else {
                Alert.alert('Error', data.message || 'Failed to cancel appointment');
              }
            } catch (error) {
              console.error('Cancel error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      {appointments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === FILTERS.ALL && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(FILTERS.ALL)}
            accessibilityLabel="Show all appointments"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === FILTERS.ALL && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === FILTERS.UPCOMING && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(FILTERS.UPCOMING)}
            accessibilityLabel="Show upcoming appointments"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === FILTERS.UPCOMING && styles.filterTextActive,
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === FILTERS.PAST && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(FILTERS.PAST)}
            accessibilityLabel="Show past appointments"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === FILTERS.PAST && styles.filterTextActive,
              ]}
            >
              Past
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === FILTERS.CANCELLED && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(FILTERS.CANCELLED)}
            accessibilityLabel="Show cancelled appointments"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === FILTERS.CANCELLED && styles.filterTextActive,
              ]}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {filteredAppointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>
            {activeFilter === FILTERS.ALL
              ? 'No appointments found'
              : `No ${activeFilter} appointments`}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeFilter === FILTERS.ALL
              ? 'Book your first appointment to get started'
              : 'Try selecting a different filter'}
          </Text>
          {activeFilter === FILTERS.ALL && (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigation.navigate('Doctors')}
              accessibilityLabel="Find doctors"
              accessibilityRole="button"
            >
              <Text style={styles.bookButtonText}>Find Doctors</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              onQueueInfo={handleQueueInfo}
              onMakePayment={handleMakePayment}
              onCancel={handleCancel}
              onLocationPress={handleLocationPress}
              token={token}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={true}
        />
      )}

      {/* Queue Info Modal */}
      <QueueInfoScreen
        visible={showQueueInfo}
        onClose={() => {
          setShowQueueInfo(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        token={token}
      />

      {/* Map Modal */}
      <MapModal
        visible={showMap}
        onClose={() => {
          setShowMap(false);
          setMapLocation(null);
        }}
        location={mapLocation}
        doctorName={mapDoctorName}
        address={mapAddress}
      />

      {/* Razorpay Payment Modal */}
      <RazorpayPaymentModal
        visible={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPaymentAppointment(null);
          setIsProcessingPayment(false);
        }}
        appointment={selectedPaymentAppointment}
        token={token}
        onSuccess={handlePaymentSuccess}
      />
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyAppointmentsScreen;
