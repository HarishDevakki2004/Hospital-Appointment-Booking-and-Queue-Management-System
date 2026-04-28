import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { DoctorContext } from '../../context/DoctorContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import { decodeJWT } from '../../utils/base64';
import ErrorBoundary from '../../components/ErrorBoundary';

const SlotQueueManagementScreen = ({ navigation }) => {
  const { dToken } = useContext(DoctorContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMarkingWrong, setIsMarkingWrong] = useState(false);
  const [actualDuration, setActualDuration] = useState('');
  const [servingTimers, setServingTimers] = useState({}); // Track serving timers
  const [loadingQueueData, setLoadingQueueData] = useState(false);
  const [queueError, setQueueError] = useState(null);

  useEffect(() => {
    if (dToken) {
      fetchSlots();
    }
  }, [dToken, selectedDate]);

  useEffect(() => {
    if (selectedSlot?._id) {
      fetchQueueData();
    } else {
      setQueueData(null);
    }
  }, [selectedSlot?._id]);

  // Update serving timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (appointments.length > 0) {
        const updatedTimers = {};
        appointments.forEach((apt) => {
          if (apt.status === 'SERVING' && apt.servingStartedAt) {
            const elapsedMs = Date.now() - apt.servingStartedAt;
            const elapsedSec = Math.floor(elapsedMs / 1000);
            const minutes = Math.floor(elapsedSec / 60);
            const seconds = elapsedSec % 60;
            updatedTimers[apt._id] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          }
        });
        if (Object.keys(updatedTimers).length > 0) {
          setServingTimers(updatedTimers);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [appointments]);

  // SAME LOGIC AS WEB - Fetch slots
  const fetchSlots = useCallback(async () => {
    if (!dToken) return;
    setIsLoading(true);
    try {
      let doctorId;
      try {
        const payload = decodeJWT(dToken);
        doctorId = payload.id;
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        Alert.alert('Error', 'Invalid token');
        setIsLoading(false);
        return;
      }

      const { data } = await axios.get(
        `${API_BASE}/api/availability/slots/${doctorId}?date=${selectedDate}`,
        { headers: { dToken } }
      );

      if (data.success) {
        setSlots(data.slots);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      Alert.alert('Error', 'Failed to load slots');
    } finally {
      setIsLoading(false);
    }
  }, [dToken, selectedDate]);

  // Fetch queue data with appointments
  const fetchQueueData = useCallback(async () => {
    if (!selectedSlot?._id || !dToken) {
      setQueueData(null);
      setAppointments([]);
      setQueueError(null);
      return;
    }
    
    setLoadingQueueData(true);
    setQueueError(null);
    
    try {
      console.log('Fetching queue data for slot:', selectedSlot._id);
      const { data } = await axios.get(
        `${API_BASE}/api/slot-queue/${selectedSlot._id}`,
        { headers: { dToken }, timeout: 10000 }
      );

      console.log('Queue data response:', JSON.stringify(data, null, 2));

      if (data && data.success && data.queueSnapshot) {
        try {
          // Validate queueSnapshot structure
          const snapshot = data.queueSnapshot;
          if (!snapshot || typeof snapshot !== 'object') {
            throw new Error('Invalid queue snapshot structure');
          }
          
          setQueueData(snapshot);
          // Set appointments sorted by token index
          if (snapshot.appointments && Array.isArray(snapshot.appointments)) {
            const sortedAppointments = [...snapshot.appointments].sort(
              (a, b) => (a.slotTokenIndex || 0) - (b.slotTokenIndex || 0)
            );
            setAppointments(sortedAppointments);
          } else {
            setAppointments([]);
          }
          setQueueError(null);
        } catch (parseError) {
          console.error('Error parsing queue data:', parseError);
          setQueueError('Invalid queue data format: ' + parseError.message);
          setQueueData(null);
          setAppointments([]);
        }
      } else {
        const errorMsg = data?.message || 'Failed to load queue data';
        console.error('Queue data fetch failed:', errorMsg);
        setQueueError(errorMsg);
        setQueueData(null);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load queue data';
      setQueueError(errorMsg);
      setQueueData(null);
      setAppointments([]);
    } finally {
      setLoadingQueueData(false);
    }
  }, [selectedSlot?._id, dToken]);

  // Format time from timestamp
  const formatTime = (timestamp) => {
    try {
      if (!timestamp) return 'N/A';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error('Error formatting time:', e, timestamp);
      return 'N/A';
    }
  };

  // Start serving session for the queue (one-time operation)
  const handleStartSession = async () => {
    if (!selectedSlot?._id) {
      Alert.alert('Error', 'No slot selected');
      return;
    }

    Alert.alert(
      'Start Serving Session',
      'Are you sure you want to start the serving session? This will begin serving the first waiting patient.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Session',
          onPress: async () => {
            try {
              const { data } = await axios.post(
                `${API_BASE}/api/slot-queue/queues/${selectedSlot._id}/start_session`,
                {},
                { headers: { dToken } }
              );

              if (data.success) {
                Alert.alert('Success', 'Serving session started successfully');
                fetchQueueData();
                fetchSlots();
              } else {
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              console.error('Error starting session:', error);
              if (error.response?.status === 409) {
                Alert.alert('Session Already Started', 'The serving session has already been started for this queue.');
              } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to start session');
              }
            }
          },
        },
      ]
    );
  };

  // Mark appointment as completed
  const handleMarkCompleted = async (appointment) => {
    if (!appointment || !appointment._id) {
      Alert.alert('Warning', 'Invalid appointment');
      return;
    }

    // Check if appointment is currently being served
    if (appointment.status !== 'SERVING') {
      Alert.alert('Warning', `This appointment is not currently being served. Current status: ${appointment.status}`);
      return;
    }

    setIsCompleting(true);
    try {
      const duration = actualDuration ? parseInt(actualDuration) : null;
      const { data } = await axios.post(
        `${API_BASE}/api/slot-queue/mark-completed`,
        {
          appointmentId: appointment._id,
          actualDuration: duration,
        },
        { headers: { dToken } }
      );

      if (data.success) {
        Alert.alert('Success', 'Token marked as completed');
        setActualDuration('');
        fetchQueueData();
        fetchSlots();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error marking completed:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark as completed');
    } finally {
      setIsCompleting(false);
    }
  };

  // Mark appointment as wrong
  const handleMarkWrong = async (appointment) => {
    if (!appointment || !appointment._id) {
      Alert.alert('Warning', 'Invalid appointment');
      return;
    }

    // Check if appointment is currently being served (optional - can cancel any appointment)
    // But warn if it's not the serving one
    if (appointment.status === 'SERVING' && queueData.servingAppointmentId !== appointment._id) {
      Alert.alert('Warning', `This is not the current serving appointment.`);
      return;
    }

    Alert.alert(
      'Mark as Wrong',
      `Are you sure you want to mark Token #${appointment.slotTokenIndex} as wrong? This will skip to the next token.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Wrong',
          style: 'destructive',
          onPress: async () => {
            setIsMarkingWrong(true);
            try {
              const { data } = await axios.post(
                `${API_BASE}/api/slot-queue/mark-wrong`,
                {
                  appointmentId: appointment._id,
                },
                { headers: { dToken } }
              );

              if (data.success) {
                Alert.alert('Success', 'Token marked as wrong and skipped');
                fetchQueueData();
                fetchSlots();
              } else {
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              console.error('Error marking wrong:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to mark as wrong');
            } finally {
              setIsMarkingWrong(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading slots...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Slot Queue Management</Text>
      </View>

      {/* Date Selector */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Select Date</Text>
        <TextInput
          style={styles.dateInput}
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {slots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No slots found for this date</Text>
        </View>
      ) : (
        <View style={styles.slotsContainer}>
          {slots.map((slot) => (
            <View key={slot._id} style={styles.slotCard}>
              <TouchableOpacity
                style={styles.slotHeader}
                onPress={() => {
                  if (selectedSlot?._id === slot._id) {
                    // Deselecting - clear queue data
                    setSelectedSlot(null);
                    setQueueData(null);
                    setAppointments([]);
                    setQueueError(null);
                  } else {
                    // Selecting new slot
                    setSelectedSlot(slot);
                    setQueueError(null);
                  }
                }}
              >
                <View>
                  <Text style={styles.slotPeriod}>{slot.slotPeriod} Slot</Text>
                  <Text style={styles.slotTime}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                </View>
                <View style={styles.slotStats}>
                  <Text style={styles.slotStatText}>
                    {slot.totalTokens} tokens | Current: {slot.currentToken}
                  </Text>
                  <Text style={styles.slotStatText}>
                    Avg: {slot.averageConsultationTime} min
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Queue Details */}
              {selectedSlot?._id === slot._id && (
                <View style={styles.queueDetails}>
                  {/* Debug: Show selected slot info */}
                  {__DEV__ && (
                    <Text style={{ fontSize: 10, color: '#999', marginBottom: 8 }}>
                      Debug: Slot ID: {selectedSlot?._id}, Loading: {loadingQueueData ? 'Yes' : 'No'}, Error: {queueError || 'None'}, Has Data: {queueData ? 'Yes' : 'No'}
                    </Text>
                  )}
                  {loadingQueueData ? (
                    <View style={styles.loadingQueueContainer}>
                      <ActivityIndicator size="large" color="#10b981" />
                      <Text style={styles.loadingQueueText}>Loading queue data...</Text>
                    </View>
                  ) : queueError ? (
                    <View style={styles.errorQueueContainer}>
                      <Text style={styles.errorQueueText}>⚠️ {queueError}</Text>
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchQueueData}
                      >
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  ) : queueData ? (
                    <View>
                  {/* Start Session Button - Show only if session not started */}
                  {queueData && !queueData.servingSessionStarted && (
                    <TouchableOpacity
                      style={styles.startSessionButton}
                      onPress={handleStartSession}
                    >
                      <Text style={styles.startSessionButtonText}>▶ Start Serving Session</Text>
                    </TouchableOpacity>
                  )}

                  {/* Queue Statistics */}
                  {queueData && typeof queueData === 'object' ? (
                    <>
                  <View style={styles.queueStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{queueData.totalTokens || 0}</Text>
                      <Text style={styles.statLabel}>Total Tokens</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{queueData.currentToken || 0}</Text>
                      <Text style={styles.statLabel}>Current Token</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {Math.max(0, (queueData.totalTokens || 0) - (queueData.currentToken || 0))}
                      </Text>
                      <Text style={styles.statLabel}>Remaining</Text>
                    </View>
                  </View>

                  {/* Slot Info */}
                  <View style={styles.slotInfo}>
                    <Text style={styles.slotInfoText}>
                      📅 Date: {queueData.date || selectedSlot?.date || 'N/A'}
                    </Text>
                    <Text style={styles.slotInfoText}>
                      ⏰ Time: {queueData.startTime || selectedSlot?.startTime || 'N/A'} - {queueData.endTime || selectedSlot?.endTime || 'N/A'}
                    </Text>
                    <Text style={styles.slotInfoText}>
                      ⏱️ Avg Time: {queueData.averageConsultationTime || selectedSlot?.averageConsultationTime || 10} min
                    </Text>
                  </View>

                  {/* Appointments List */}
                  <Text style={styles.appointmentsTitle}>Appointments (Sorted by Token Order)</Text>
                  {appointments.length === 0 ? (
                    <View style={styles.emptyAppointments}>
                      <Text style={styles.emptyAppointmentsText}>No appointments booked for this slot</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={appointments || []}
                      keyExtractor={(item, index) => {
                        if (!item) return `appt-${index}`;
                        return item._id || `appt-${index}`;
                      }}
                      scrollEnabled={false}
                      renderItem={({ item, index }) => {
                        try {
                        // Safety checks
                        if (!queueData || !item) {
                          console.warn('Invalid appointment item at index:', index, item);
                          return (
                            <View style={styles.appointmentCard}>
                              <Text style={styles.patientName}>Invalid appointment data</Text>
                            </View>
                          );
                        }
                        
                        if (!item._id) {
                          console.warn('Appointment missing _id at index:', index);
                          return (
                            <View style={styles.appointmentCard}>
                              <Text style={styles.patientName}>Missing appointment ID</Text>
                            </View>
                          );
                        }
                        
                        const isCurrent = item.status === 'SERVING' || item._id === queueData.servingAppointmentId;
                        const isServing = item.status === 'SERVING';
                        const isInProgress = item.status === 'IN_PROGRESS';
                        const isCompleted = item.status === 'COMPLETED';
                        const isWaiting = item.status === 'BOOKED' || item.status === 'WAITING';
                        const userData = item.userData || {};
                        
                        // Get elapsed time from timer state or calculate
                        const elapsedTime = servingTimers[item._id] || 
                          (isServing && item.servingStartedAt ? (() => {
                            try {
                              const elapsedMs = Date.now() - item.servingStartedAt;
                              const elapsedSec = Math.floor(elapsedMs / 1000);
                              const minutes = Math.floor(elapsedSec / 60);
                              const seconds = elapsedSec % 60;
                              return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                            } catch (e) {
                              return null;
                            }
                          })() : null);

                        return (
                          <View
                            style={[
                              styles.appointmentCard,
                              isCurrent && styles.appointmentCardCurrent,
                              isCompleted && styles.appointmentCardCompleted,
                            ]}
                          >
                            <View style={styles.appointmentHeader}>
                              <View style={styles.tokenBadge}>
                                <Text style={styles.tokenBadgeText}>Token #{item.slotTokenIndex}</Text>
                              </View>
                              <View style={styles.statusBadge}>
                                <Text
                                  style={[
                                    styles.statusBadgeText,
                                    isServing && styles.statusBadgeTextServing,
                                    isInProgress && styles.statusBadgeTextActive,
                                    isCompleted && styles.statusBadgeTextCompleted,
                                  ]}
                                >
                                  {isServing ? 'Serving' :
                                   item.status === 'IN_PROGRESS' ? 'In Progress' :
                                   item.status === 'COMPLETED' ? 'Completed' : 'Booked'}
                                </Text>
                              </View>
                              {isServing && elapsedTime && (
                                <View style={styles.timerContainer}>
                                  <Text style={styles.timerText}>⏱️ {elapsedTime}</Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.patientInfo}>
                              <Text style={styles.patientName}>
                                👤 {userData.name || 'Unknown Patient'}
                              </Text>
                              <Text style={styles.patientDetail}>
                                📧 {userData.email || 'N/A'}
                              </Text>
                              <Text style={styles.patientDetail}>
                                📞 {userData.phone || 'N/A'}
                              </Text>
                              <Text style={styles.patientDetail}>
                                ⏰ Est. Start: {item.estimatedStart ? formatTime(item.estimatedStart) : 'N/A'}
                              </Text>
                              {item.actualConsultDuration && (
                                <Text style={styles.patientDetail}>
                                  ⏱️ Duration: {item.actualConsultDuration} min
                                </Text>
                              )}
                            </View>

                            {/* Action Buttons - Show when serving (no per-patient start button) */}
                            {isServing && (
                              <View style={styles.actionButtons}>
                                <Text style={styles.currentTokenLabel}>
                                  🎯 Currently Serving This Token
                                </Text>
                                <TextInput
                                  style={styles.durationInput}
                                  value={actualDuration}
                                  onChangeText={setActualDuration}
                                  placeholder="Actual duration (minutes)"
                                  keyboardType="numeric"
                                />
                                <View style={styles.buttonRow}>
                                  <TouchableOpacity
                                    style={[styles.actionButton, styles.completeButton]}
                                    onPress={() => handleMarkCompleted(item)}
                                    disabled={isCompleting || isMarkingWrong}
                                  >
                                    {isCompleting ? (
                                      <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                      <Text style={styles.actionButtonText}>✓ Completed</Text>
                                    )}
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.actionButton, styles.wrongButton]}
                                    onPress={() => handleMarkWrong(item)}
                                    disabled={isMarkingWrong || isCompleting}
                                  >
                                    {isMarkingWrong ? (
                                      <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                      <Text style={styles.actionButtonText}>✗ Wrong</Text>
                                    )}
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>
                        );
                        } catch (renderError) {
                          console.error('Error rendering appointment item:', renderError, item);
                          return (
                            <View style={styles.appointmentCard}>
                              <Text style={styles.patientName}>⚠️ Error rendering appointment</Text>
                              <Text style={styles.patientDetail}>{renderError?.message || 'Unknown error'}</Text>
                            </View>
                          );
                        }
                      }}
                    />
                  )}
                    </>
                  ) : null}
                    </View>
                  ) : (
                    <View style={styles.emptyQueueContainer}>
                      <Text style={styles.emptyQueueText}>No queue data available</Text>
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchQueueData}
                      >
                        <Text style={styles.retryButtonText}>Load Queue Data</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      </ScrollView>
    </ErrorBoundary>
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
  header: {
    backgroundColor: '#10b981',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateLabel: {
    fontSize: 14,
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
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  slotsContainer: {
    padding: 16,
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slotHeader: {
    backgroundColor: '#10b981',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slotPeriod: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    color: '#d1fae5',
  },
  slotStats: {
    alignItems: 'flex-end',
  },
  slotStatText: {
    fontSize: 12,
    color: '#d1fae5',
    marginBottom: 2,
  },
  queueDetails: {
    padding: 16,
  },
  queueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  slotInfo: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  slotInfoText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  emptyAppointments: {
    padding: 20,
    alignItems: 'center',
  },
  emptyAppointmentsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentCardCurrent: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  appointmentCardCompleted: {
    borderColor: '#9ca3af',
    backgroundColor: '#f9fafb',
    opacity: 0.7,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tokenBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusBadgeTextActive: {
    color: '#ef4444',
  },
  statusBadgeTextCompleted: {
    color: '#10b981',
  },
  statusBadgeTextServing: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  timerContainer: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  startServingButton: {
    backgroundColor: '#3b82f6',
    marginBottom: 8,
  },
  startSessionButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  startSessionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  patientInfo: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  patientDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  actionButtons: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
  },
  currentTokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  wrongButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingQueueContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingQueueText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorQueueContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    margin: 16,
  },
  errorQueueText: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyQueueContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyQueueText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
});

export default SlotQueueManagementScreen;


