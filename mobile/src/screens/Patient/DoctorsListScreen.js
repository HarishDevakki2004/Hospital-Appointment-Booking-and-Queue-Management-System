import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import { getDefaultAvatar } from '../../assets';

const DoctorsListScreen = ({ navigation, route }) => {
  const { doctors, getDoctorsData } = useContext(AppContext);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState(route?.params?.speciality || '');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const specialities = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  useEffect(() => {
    getDoctorsData();
  }, []);

  // Update speciality filter when route params change (from MedicalAssistant)
  useEffect(() => {
    if (route?.params?.speciality) {
      setSelectedSpeciality(route.params.speciality);
    }
  }, [route?.params?.speciality]);

  useEffect(() => {
    applyFilters();
  }, [doctors, selectedSpeciality, onlyAvailable, searchQuery]);

  const applyFilters = () => {
    let filtered = [...doctors];

    // Filter by speciality
    if (selectedSpeciality) {
      filtered = filtered.filter((doc) => doc.speciality === selectedSpeciality);
    }

    // Filter by availability
    if (onlyAvailable) {
      filtered = filtered.filter((doc) => doc.available);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.speciality.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const renderDoctor = ({ item }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorProfile', { doctorId: item._id })}
    >
      <Image 
        source={item.image ? { uri: item.image } : getDefaultAvatar()} 
        style={styles.doctorImage} 
      />
      <View style={styles.doctorInfo}>
        <View style={styles.doctorHeader}>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{item.name}</Text>
            <Text style={styles.doctorSpeciality}>{item.speciality}</Text>
          </View>
          {item.available && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableText}>Available</Text>
            </View>
          )}
        </View>
        <Text style={styles.doctorDegree}>{item.degree}</Text>
        <Text style={styles.doctorExperience}>{item.experience} years experience</Text>
        <View style={styles.doctorFooter}>
          <Text style={styles.doctorFees}>₹{item.fees}</Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('DoctorProfile', { doctorId: item._id })}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialityFilter}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedSpeciality && styles.filterChipActive]}
            onPress={() => setSelectedSpeciality('')}
          >
            <Text style={[styles.filterText, !selectedSpeciality && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {specialities.map((spec, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.filterChip, selectedSpeciality === spec && styles.filterChipActive]}
              onPress={() => setSelectedSpeciality(spec)}
            >
              <Text style={[styles.filterText, selectedSpeciality === spec && styles.filterTextActive]}>
                {spec}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.availableFilter, onlyAvailable && styles.availableFilterActive]}
          onPress={() => setOnlyAvailable(!onlyAvailable)}
        >
          <Text style={[styles.availableFilterText, onlyAvailable && styles.availableFilterTextActive]}>
            Available Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Doctors List */}
      {filteredDoctors.length > 0 ? (
        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctor}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No doctors found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  specialityFilter: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  availableFilter: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  availableFilterActive: {
    backgroundColor: '#3b82f6',
  },
  availableFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  availableFilterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  doctorCard: {
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
  doctorImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  doctorInfo: {
    padding: 16,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  doctorSpeciality: {
    fontSize: 16,
    color: '#6b7280',
  },
  availableBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  doctorDegree: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  doctorExperience: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorFees: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default DoctorsListScreen;

