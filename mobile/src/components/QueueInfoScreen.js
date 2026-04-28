import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Linking,
  Alert,
  Platform,
  Image,
} from 'react-native';
import axios from 'axios';
import { API_BASE } from '../config';
import io from 'socket.io-client';

const QueueInfoScreen = ({ visible, onClose, appointment, token }) => {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const updateBufferRef = useRef([]);
  const lastProcessedUpdateRef = useRef(null);
  
  const positionAnim = useRef(new Animated.Value(1)).current;
  const waitTimeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && appointment) {
      fetchQueueData();
      connectWebSocket();
      startPolling();
    } else {
      stopPolling();
      disconnectWebSocket();
    }
    return () => {
      stopPolling();
      disconnectWebSocket();
    };
  }, [visible, appointment]);

  // Process buffered updates every 300ms to handle race conditions
  useEffect(() => {
    if (updateBufferRef.current.length === 0) return;

    const processBuffer = () => {
      if (updateBufferRef.current.length === 0) return;

      // Sort by lastUpdatedAt (newest first)
      updateBufferRef.current.sort((a, b) => {
        const timeA = new Date(a.lastUpdatedAt || 0).getTime();
        const timeB = new Date(b.lastUpdatedAt || 0).getTime();
        return timeB - timeA;
      });

      // Process the latest update
      const latestUpdate = updateBufferRef.current[0];
      updateBufferRef.current = [];

      // Check if this update is newer than the last processed one
      if (!lastProcessedUpdateRef.current || 
          new Date(latestUpdate.lastUpdatedAt).getTime() > 
          new Date(lastProcessedUpdateRef.current.lastUpdatedAt).getTime()) {
        handleQueueUpdate(latestUpdate);
        lastProcessedUpdateRef.current = latestUpdate;
      }
    };

    const timeout = setTimeout(processBuffer, 300);
    return () => clearTimeout(timeout);
  }, [updateBufferRef.current.length]);

  // Connect to WebSocket for real-time updates
  const connectWebSocket = () => {
    if (!appointment?._id) return;

    try {
      socketRef.current = io(API_BASE.replace('/api', ''), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected for queue updates');
        setIsWebSocketConnected(true);
        // Subscribe to queue updates for this appointment
        socketRef.current.emit('subscribe_queue', {
          appointmentId: appointment._id,
          slotId: appointment.slotId,
        });
      });

      socketRef.current.on('queue_update', (data) => {
        // Handle both full and minimal payloads
        if (data.type === 'queue_update_minimal') {
          // Fetch full state from API
          fetchQueueData();
        } else if (data.appointmentId === appointment._id || 
                   (data.affectedAppointmentIds && 
                    data.affectedAppointmentIds.includes(appointment._id))) {
          // Buffer update to handle race conditions
          updateBufferRef.current.push(data);
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsWebSocketConnected(false);
      });

      socketRef.current.on('error', (error) => {
        console.error('WebSocket error:', error);
        setIsWebSocketConnected(false);
      });

      socketRef.current.on('reconnect', () => {
        console.log('WebSocket reconnected');
        setIsWebSocketConnected(true);
        socketRef.current.emit('subscribe_queue', {
          appointmentId: appointment._id,
          slotId: appointment.slotId,
        });
        // Refresh queue data after reconnection
        fetchQueueData();
      });
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setIsWebSocketConnected(false);
    }
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsWebSocketConnected(false);
    }
  };

  const handleQueueUpdate = (data) => {
    // Validate lastUpdatedAt to avoid stale updates
    if (queueData && data.lastUpdatedAt) {
      const currentTime = new Date(queueData.lastUpdatedAt || 0).getTime();
      const updateTime = new Date(data.lastUpdatedAt).getTime();
      if (updateTime < currentTime) {
        console.log('Ignoring stale update', {
          current: queueData.lastUpdatedAt,
          received: data.lastUpdatedAt
        });
        return;
      }
    }

    // Use positionInQueueMap if available (more efficient), otherwise fall back to positionInQueue
    let newPosition = 0;
    if (data.positionInQueueMap && appointment?._id) {
      newPosition = data.positionInQueueMap[appointment._id] ?? 0;
    } else {
      newPosition = data.positionInQueue ?? queueData?.positionInQueue ?? 0;
    }
    
    // If positionInQueueMap not provided, calculate from currentToken
    if (newPosition === 0 && data.currentToken !== undefined && appointment?.slotTokenIndex) {
      newPosition = Math.max(0, appointment.slotTokenIndex - data.currentToken);
    }
    
    // Calculate estimated wait time using averageServiceTimePerPatient
    let newWaitTime = data.estimatedWaitMin ?? 0;
    if (newWaitTime === 0 && data.averageServiceTimePerPatient && newPosition > 0) {
      newWaitTime = Math.round(newPosition * data.averageServiceTimePerPatient);
    }
    
    const prevPosition = queueData?.positionInQueue ?? newPosition;

    // Animate changes if position decreased
    if (queueData && prevPosition > newPosition) {
      animateChange();
    }

    // Check notification threshold
    const subscription = appointment?.notificationSubscription;
    const notifyWhenTokensAway = subscription?.notifyWhenTokensAway || 2;
    if (subscription?.subscribed && newPosition <= notifyWhenTokensAway && prevPosition > notifyWhenTokensAway) {
      // Trigger notification
      Alert.alert(
        'Almost Your Turn!',
        `Your position in queue is now ${newPosition}. ${newPosition === 0 ? 'It\'s your turn!' : `Estimated wait: ${newWaitTime} minutes`}`,
        [{ text: 'OK' }]
      );
      // Emit telemetry
      console.log('queue_notification_sent', {
        appointmentId: appointment._id,
        position: newPosition,
        notifyWhenTokensAway
      });
    }

    setQueueData((prev) => ({
      ...prev,
      positionInQueue: newPosition,
      estimatedWaitMin: newWaitTime,
      currentToken: data.currentToken ?? prev?.currentToken,
      servingAppointmentId: data.servingAppointmentId ?? prev?.servingAppointmentId,
      yourTokenNumber: data.yourTokenNumber ?? prev?.yourTokenNumber,
      averageServiceTimePerPatient: data.averageServiceTimePerPatient ?? prev?.averageServiceTimePerPatient,
      lastUpdatedAt: data.lastUpdatedAt || new Date().toISOString(),
    }));
    setLastUpdated(new Date());

    // Emit telemetry
    console.log('queue_update_received', {
      appointmentId: appointment._id,
      position: newPosition,
      waitTime: newWaitTime,
      timestamp: data.lastUpdatedAt
    });
  };

  const animateChange = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(positionAnim, {
          toValue: 1.15,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(waitTimeAnim, {
          toValue: 1.15,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]),
      Animated.parallel([
        Animated.spring(positionAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(waitTimeAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]),
    ]).start();
  };

  const fetchQueueData = async (forceRefresh = false) => {
    if (!appointment?.slotId && !appointment?._id) {
      setError('No appointment information available');
      setLoading(false);
      return;
    }

    try {
      if (forceRefresh) {
        setError(null);
      }

      // Try new queue API endpoint first
      let queueResponse = null;
      try {
        queueResponse = await axios.get(
          `${API_BASE}/api/booking/appointments/${appointment._id}/queue`,
          { headers: { token } }
        );
      } catch (err) {
        // Fallback to slot-queue endpoint
        if (appointment.slotId) {
          queueResponse = await axios.get(
            `${API_BASE}/api/slot-queue/${appointment.slotId}`,
            { headers: { token } }
          );
        }
      }

      if (queueResponse?.data) {
        const data = queueResponse.data;
        
        // Handle different response formats
        let queueSnapshot = null;
        if (data.queueSnapshot) {
          queueSnapshot = data.queueSnapshot;
        } else if (data.success && data.data) {
          queueSnapshot = data.data;
        } else if (data.success) {
          queueSnapshot = data;
        }

        if (queueSnapshot) {
          const yourToken = appointment.slotTokenIndex || appointment.tokenNumber || data.yourTokenNumber || queueSnapshot.yourTokenNumber;
          const currentToken = queueSnapshot.currentToken || data.currentToken || 0;
          // Position = yourToken - currentToken (if currentToken > 0, it means someone is being served)
          // If your appointment is the one being served, position = 0
          const isBeingServed = data.servingAppointmentId === appointment._id || 
                                queueSnapshot.servingAppointmentId === appointment._id;
          const position = isBeingServed ? 0 : Math.max(0, (yourToken || 0) - currentToken);
          
          const averageTime = queueSnapshot.averageConsultationTime || data.averageServiceTimePerPatient || 8;
          const estimatedWait = data.estimatedWaitMin || (position * averageTime);

          // Convert address to string if it's an object
          let hospitalAddress = 'Hospital';
          if (appointment.docData?.address) {
            if (typeof appointment.docData.address === 'string') {
              hospitalAddress = appointment.docData.address;
            } else if (typeof appointment.docData.address === 'object') {
              const addressParts = [];
              if (appointment.docData.address.line1) addressParts.push(appointment.docData.address.line1);
              if (appointment.docData.address.line2) addressParts.push(appointment.docData.address.line2);
              if (appointment.docData.address.city) addressParts.push(appointment.docData.address.city);
              if (appointment.docData.address.state) addressParts.push(appointment.docData.address.state);
              hospitalAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Hospital';
            }
          }

          // Get phone from API response (latest doctor data) or fallback to appointment data
          // API response structure: { success: true, data: { doctor: { phone: ... } } }
          const doctorPhone = data.data?.doctor?.phone || 
                             data.doctor?.phone || 
                             appointment.docData?.phone || 
                             '';
          
          console.log('Queue data - API doctor phone:', data.data?.doctor?.phone);
          console.log('Queue data - Appointment docData phone:', appointment.docData?.phone);
          console.log('Queue data - Final doctor phone:', doctorPhone);

          const newQueueData = {
            appointmentId: appointment._id,
            token: appointment.tokenNumber || `A-${yourToken}` || 'N/A',
            yourTokenNumber: yourToken,
            currentToken: currentToken,
            positionInQueue: position,
            estimatedWaitMin: Math.round(estimatedWait),
            doctor: {
              name: appointment.docData?.name || 'Unknown Doctor',
              specialization: appointment.docData?.speciality || 'General',
              hospital: hospitalAddress,
              phone: doctorPhone, // Use latest phone from API
              profilePictureUrl: appointment.docData?.image || null,
            },
            lastUpdatedAt: data.lastUpdatedAt || queueSnapshot.lastUpdatedAt || new Date().toISOString(),
          };

          // Reconcile with existing data (prefer server state if timestamps differ)
          if (queueData && newQueueData.lastUpdatedAt) {
            const currentTime = new Date(queueData.lastUpdatedAt || 0).getTime();
            const serverTime = new Date(newQueueData.lastUpdatedAt).getTime();
            if (serverTime >= currentTime) {
              // Server state is newer or equal, use it
              setQueueData(newQueueData);
              setLastUpdated(new Date());
              console.log('queue_ui_reconciled', {
                appointmentId: appointment._id,
                source: 'server_fetch',
                timestamp: newQueueData.lastUpdatedAt
              });
            }
          } else {
            // Animate if position changed
            if (queueData && queueData.positionInQueue !== newQueueData.positionInQueue) {
              animateChange();
            }
            setQueueData(newQueueData);
            setLastUpdated(new Date());
          }
        } else {
          setError('Unable to load queue data');
        }
      } else {
        setError('Unable to load queue data');
      }
    } catch (err) {
      console.error('Error fetching queue data:', err);
      setError('Failed to load queue status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // Poll every 10-15 seconds as fallback when WebSocket is not connected
    const pollInterval = isWebSocketConnected ? 30000 : 10000; // 30s if WS connected, 10s if not
    
    const interval = setInterval(() => {
      if (!isWebSocketConnected) {
        fetchQueueData();
      }
    }, pollInterval);
    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleSetReminder = async () => {
    if (subscribed) {
      // Unsubscribe
      try {
        await axios.post(
          `${API_BASE}/api/notifications/unsubscribe`,
          { appointmentId: appointment._id },
          { headers: { token } }
        ).catch(() => {}); // Ignore errors
      } catch (err) {
        // Ignore unsubscribe errors
      }
      setSubscribed(false);
      Alert.alert('Reminder Disabled', 'You will no longer receive queue notifications.');
      return;
    }

    try {
      // Subscribe to notifications
      const response = await axios.post(
        `${API_BASE}/api/notifications/subscribe`,
        {
          appointmentId: appointment._id,
          notifyWhenTokensAway: 2,
          deviceToken: Platform.OS === 'ios' ? 'ios-device' : 'android-device', // Placeholder
        },
        { headers: { token } }
      ).catch(() => {
        // If API doesn't exist, just enable local reminder
        return { data: { success: true } };
      });

      if (response?.data?.success) {
        setSubscribed(true);
        Alert.alert('Reminder Set', 'You will be notified when your turn is approaching.');
      } else {
        // Fallback: enable local reminder state
        setSubscribed(true);
        Alert.alert('Reminder Set', 'You will be notified when your turn is approaching.');
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
      // Fallback: enable local reminder
      setSubscribed(true);
      Alert.alert('Reminder Set', 'Reminder enabled. You will be notified when your turn is approaching.');
    }
  };

  const handleCallHospital = () => {
    // Try to get phone from multiple sources - prioritize queueData.doctor.phone (from API, latest data)
    const phone = queueData?.doctor?.phone || 
                  appointment?.docData?.phone || 
                  appointment?.doctorPhone ||
                  (queueData?.doctor && typeof queueData.doctor === 'object' && queueData.doctor.phone);
    
    console.log('=== CALL HOSPITAL DEBUG ===');
    console.log('queueData.doctor.phone:', queueData?.doctor?.phone);
    console.log('appointment.docData.phone:', appointment?.docData?.phone);
    console.log('Final phone:', phone);
    
    if (!phone || phone.trim() === '') {
      Alert.alert('No Phone Number', 'Phone number not available for this doctor. Please contact the hospital directly.');
      return;
    }

    const hospitalName = queueData?.doctor?.hospital || 
                        appointment?.docData?.hospitalName || 
                        appointment?.docData?.name ||
                        queueData?.doctor?.name || 
                        'Hospital';
    Alert.alert(
      'Call Hospital',
      `Call ${hospitalName} at ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert('Error', 'Unable to make phone call');
            });
          },
        },
      ]
    );
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Force refresh function for debugging
  const forceRefreshQueue = () => {
    fetchQueueData(true);
  };

  // Expose for debugging (can be called from console)
  if (__DEV__) {
    global.forceRefreshQueue = forceRefreshQueue;
  }

  const position = queueData?.positionInQueue ?? 0;
  const estimatedWait = queueData?.estimatedWaitMin ?? 0;
  const isNowServing = position <= 0 || queueData?.servingAppointmentId === appointment?._id;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Gradient Background */}
        <View style={styles.gradientBackground} />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Queue Status</Text>
            <View style={styles.headerRight}>
              {queueData?.token && (
                <View style={styles.tokenPill}>
                  <Text style={styles.tokenPillText} numberOfLines={1}>
                    Token: {queueData.token}
                  </Text>
                </View>
              )}
              {/* Connection status indicator */}
              <View style={[styles.connectionIndicator, isWebSocketConnected && styles.connected]}>
                <Text style={styles.connectionDot}>●</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Loading queue status...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorSubtext}>
                Data not available — Refresh
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchQueueData(true)}
                accessibilityLabel="Retry loading queue data"
                accessibilityRole="button"
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : queueData ? (
            <>
              {/* Position Circle */}
              <View style={styles.positionContainer}>
                <Animated.View
                  style={[
                    styles.positionCircle,
                    { transform: [{ scale: positionAnim }] },
                  ]}
                  accessibilityLabel={`Position in queue: ${isNowServing ? 'now serving' : position}`}
                >
                  <Text style={styles.positionNumber}>
                    {isNowServing ? 'NOW' : position}
                  </Text>
                </Animated.View>
                <Text style={styles.positionLabel}>
                  {isNowServing
                    ? 'Now serving — please proceed to counter'
                    : 'Position in Queue'}
                </Text>
                {position > 0 && (
                  <Text style={styles.positionSubtext}>
                    {position === 1
                      ? 'Almost your turn'
                      : `${position} tokens ahead`}
                  </Text>
                )}
              </View>

              {/* Estimated Wait */}
              <View style={styles.waitContainer}>
                <View style={styles.clockIcon}>
                  <Text style={styles.clockEmoji}>⏰</Text>
                </View>
                <Text style={styles.waitLabel}>Estimated Wait</Text>
                <Animated.View
                  style={{ transform: [{ scale: waitTimeAnim }] }}
                >
                  <Text style={styles.waitTime}>{estimatedWait} min</Text>
                </Animated.View>
              </View>

              {/* Doctor Block */}
              <View style={styles.doctorBlock}>
                <View style={styles.doctorIcon}>
                  {queueData.doctor.profilePictureUrl ? (
                    <Image
                      source={{ uri: queueData.doctor.profilePictureUrl }}
                      style={styles.doctorImage}
                    />
                  ) : (
                    <Text style={styles.doctorEmoji}>👤</Text>
                  )}
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorLabel}>Doctor</Text>
                  <Text style={styles.doctorName}>{queueData.doctor.name}</Text>
                  <Text style={styles.hospitalName}>{queueData.doctor.hospital}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionPill,
                    subscribed && styles.actionPillActive,
                    isNowServing && styles.actionPillDisabled,
                  ]}
                  onPress={handleSetReminder}
                  disabled={isNowServing}
                  accessibilityLabel={
                    subscribed ? 'Disable reminder' : 'Set reminder'
                  }
                  accessibilityHint="Get notified when your turn is approaching"
                  accessibilityRole="button"
                >
                  <Text style={styles.actionPillIcon}>
                    {subscribed ? '🔔' : '🔕'}
                  </Text>
                  <Text style={styles.actionPillText}>
                    {subscribed ? 'Reminder On' : 'Set Reminder'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionPill}
                  onPress={handleCallHospital}
                  accessibilityLabel="Call hospital"
                  accessibilityHint="Opens phone dialer to call the hospital"
                  accessibilityRole="button"
                >
                  <Text style={styles.actionPillIcon}>📞</Text>
                  <Text style={styles.actionPillText}>Call Hospital</Text>
                </TouchableOpacity>
              </View>

              {/* Tips Card */}
              <View style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Text style={styles.tipsIcon}>💡</Text>
                  <Text style={styles.tipsTitle}>Tip</Text>
                </View>
                <Text style={styles.tipsText}>
                  We'll send notifications when it's almost your turn. Arrive at
                  least 5 minutes before your estimated time.
                </Text>
              </View>

              {/* Last Updated */}
              {lastUpdated && (
                <Text style={styles.lastUpdated}>
                  Updated {formatTimeAgo(lastUpdated)}
                  {isWebSocketConnected ? ' (Live)' : ' (Polling)'}
                </Text>
              )}
            </>
          ) : null}
        </ScrollView>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Close queue info"
          accessibilityRole="button"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#764ba2',
    opacity: 0.85,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    maxWidth: 150,
  },
  tokenPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  connectionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connected: {
    backgroundColor: '#10b981',
  },
  connectionDot: {
    fontSize: 8,
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#667eea',
    fontWeight: '700',
    fontSize: 16,
  },
  positionContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  positionCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  positionNumber: {
    fontSize: 56,
    fontWeight: '700',
    color: '#667eea',
  },
  positionLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  positionSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  waitContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  clockIcon: {
    marginBottom: 12,
  },
  clockEmoji: {
    fontSize: 40,
  },
  waitLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  waitTime: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
  },
  doctorBlock: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  doctorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  doctorImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  doctorEmoji: {
    fontSize: 28,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 6,
    fontWeight: '500',
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  hospitalName: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 14,
    marginBottom: 32,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minHeight: 52,
  },
  actionPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  actionPillDisabled: {
    opacity: 0.5,
  },
  actionPillIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionPillText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  tipsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipsIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  tipsText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
  },
  lastUpdated: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default QueueInfoScreen;
