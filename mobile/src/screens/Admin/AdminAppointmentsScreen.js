import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { AdminContext } from '../../context/AdminContext';

const AdminAppointmentsScreen = ({ navigation }) => {
  const { appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext);

  useEffect(() => {
    getAllAppointments();
  }, []);

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentInfo}>
        <Text style={styles.patientName}>{item.userData?.name}</Text>
        <Text style={styles.doctorName}>Dr. {item.docData?.name}</Text>
        <Text style={styles.appointmentDate}>
          {item.slotDate} at {item.slotTime}
        </Text>
        {item.slotTokenIndex && (
          <Text style={styles.tokenText}>Token: #{item.slotTokenIndex}</Text>
        )}
        {!item.cancelled && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelAppointment(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  doctorName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
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

export default AdminAppointmentsScreen;


