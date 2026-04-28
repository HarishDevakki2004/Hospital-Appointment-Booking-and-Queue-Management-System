import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { DoctorContext } from '../../context/DoctorContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import { decodeJWT } from '../../utils/base64';

const AvailabilityManagementScreen = ({ navigation }) => {
  const { dToken } = useContext(DoctorContext);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '13:00',
    slotPeriod: 'MORNING',
    capacity: '',
  });

  // Load availability on mount and when date changes
  useEffect(() => {
    if (dToken) {
      loadAvailability();
    }
  }, [dToken, selectedDate]);

  // Get doctor ID from token
  const getDoctorId = () => {
    if (!dToken) {
      return null;
    }
    try {
      const payload = decodeJWT(dToken);
      return payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Load availability slots
  const loadAvailability = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) {
      Alert.alert('Error', 'Unable to get doctor information. Please login again.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/availability/list?doctorId=${doctorId}&date=${selectedDate}`,
        { headers: { dToken } }
      );

      if (data.success) {
        setSlots(data.slots || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load availability');
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new availability slot
  const handleCreateSlot = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) {
      Alert.alert('Error', 'Unable to get doctor information. Please login again.');
      return;
    }

    if (!formData.date || !formData.startTime || !formData.endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        doctorId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotPeriod: formData.slotPeriod,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };

      const { data } = await axios.post(
        `${API_BASE}/api/availability/create`,
        payload,
        { headers: { dToken } }
      );

      if (data.success) {
        Alert.alert('Success', `Created ${data.slots?.length || 1} slot(s)`);
        setShowForm(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '13:00',
          slotPeriod: 'MORNING',
          capacity: '',
        });
        loadAvailability();
      } else {
        Alert.alert('Error', data.message || 'Failed to create slot');
      }
    } catch (error) {
      console.error('Error creating slot:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create slot');
    }
  };

  // Check if user is logged in
  if (!dToken) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Please login to continue</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DoctorLogin')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Availability Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>{showForm ? 'Cancel' : '+ Add Slot'}</Text>
        </TouchableOpacity>
      </View>

      {/* Date Filter */}
      <View style={styles.dateFilter}>
        <Text style={styles.label}>Filter by Date</Text>
        <TextInput
          style={styles.dateInput}
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {/* Create Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Create New Slot</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Slot Period</Text>
            <View style={styles.periodContainer}>
              {['MORNING', 'AFTERNOON', 'EVENING'].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    formData.slotPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, slotPeriod: period })}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      formData.slotPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Time</Text>
            <TextInput
              style={styles.input}
              value={formData.startTime}
              onChangeText={(text) => setFormData({ ...formData, startTime: text })}
              placeholder="HH:MM (e.g., 10:00)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Time</Text>
            <TextInput
              style={styles.input}
              value={formData.endTime}
              onChangeText={(text) => setFormData({ ...formData, endTime: text })}
              placeholder="HH:MM (e.g., 13:00)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capacity (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.capacity}
              onChangeText={(text) => setFormData({ ...formData, capacity: text })}
              placeholder="Leave empty for unlimited"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleCreateSlot}>
            <Text style={styles.submitButtonText}>Create Slot</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      )}

      {/* Slots List */}
      {!isLoading && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {slots.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No availability slots found</Text>
              <Text style={styles.emptySubtext}>Create a new slot to get started</Text>
            </View>
          ) : (
            <View style={styles.slotsContainer}>
              {slots.map((slot) => (
                <View key={slot._id || slot.id} style={styles.slotCard}>
                  <Text style={styles.slotPeriod}>{slot.slotPeriod || 'N/A'}</Text>
                  <Text style={styles.slotDate}>Date: {slot.date || 'N/A'}</Text>
                  <Text style={styles.slotTime}>
                    Time: {slot.startTime || 'N/A'} - {slot.endTime || 'N/A'}
                  </Text>
                  {slot.capacity && (
                    <Text style={styles.slotCapacity}>
                      Capacity: {slot.totalTokens || 0} / {slot.capacity} tokens
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#10b981',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 14,
  },
  dateFilter: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
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
    backgroundColor: '#fff',
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#10b981',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  slotsContainer: {
    gap: 12,
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slotPeriod: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  slotDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  slotCapacity: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AvailabilityManagementScreen;

