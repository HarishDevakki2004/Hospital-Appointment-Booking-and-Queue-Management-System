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
import { AdminContext } from '../../context/AdminContext';
import { getDefaultAvatar } from '../../assets';

const AdminDoctorsScreen = ({ navigation }) => {
  const { doctors, getAllDoctors, changeAvailability } = useContext(AdminContext);

  useEffect(() => {
    getAllDoctors();
  }, []);

  const renderDoctor = ({ item }) => (
    <View style={styles.doctorCard}>
      <Image 
        source={item.image ? { uri: item.image } : getDefaultAvatar()} 
        style={styles.doctorImage} 
      />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.speciality}>{item.speciality}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.availabilityButton, item.available && styles.availabilityButtonActive]}
            onPress={() => changeAvailability(item._id)}
          >
            <Text style={[styles.availabilityText, item.available && styles.availabilityTextActive]}>
              {item.available ? 'Available' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {doctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No doctors found</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          renderItem={renderDoctor}
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
  doctorCard: {
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
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  speciality: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  availabilityButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  availabilityButtonActive: {
    backgroundColor: '#10b981',
  },
  availabilityText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  availabilityTextActive: {
    color: '#fff',
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

export default AdminDoctorsScreen;


