import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { DoctorContext } from '../../context/DoctorContext';
import { getDefaultAvatar } from '../../assets';

const DoctorAppointmentsScreen = ({ navigation }) => {
  const { appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext);

  useEffect(() => {
    getAppointments();
  }, []);

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Image 
        source={item.userData?.image ? { uri: item.userData.image } : getDefaultAvatar()} 
        style={styles.patientImage} 
      />
      <View style={styles.appointmentInfo}>
        <Text style={styles.patientName}>{item.userData?.name}</Text>
        <Text style={styles.appointmentDate}>
          {item.slotDate} at {item.slotTime}
        </Text>
        {item.slotTokenIndex && (
          <Text style={styles.tokenText}>Token: #{item.slotTokenIndex}</Text>
        )}
        <View style={styles.actions}>
          {!item.isCompleted && !item.cancelled && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => completeAppointment(item._id)}
            >
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No appointments</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  list: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
    marginRight: 16,
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default DoctorAppointmentsScreen;


