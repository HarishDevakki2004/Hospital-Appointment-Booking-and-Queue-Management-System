import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3; // 3 cards per row with padding

const specialityData = [
  { speciality: 'General physician', icon: '👨‍⚕️', color: '#3b82f6' },
  { speciality: 'Gynecologist', icon: '👩‍⚕️', color: '#ec4899' },
  { speciality: 'Dermatologist', icon: '🔬', color: '#10b981' },
  { speciality: 'Pediatricians', icon: '👶', color: '#f59e0b' },
  { speciality: 'Neurologist', icon: '🧠', color: '#8b5cf6' },
  { speciality: 'Gastroenterologist', icon: '🫀', color: '#ef4444' },
];

const SpecialityMenu = () => {
  const navigation = useNavigation();

  const renderSpeciality = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: item.color + '15' },
        index % 3 === 2 && styles.lastCardInRow,
      ]}
      onPress={() => navigation.navigate('Doctors', { speciality: item.speciality })}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <Text style={[styles.specialityText, { color: item.color }]} numberOfLines={2}>
        {item.speciality}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Specialties</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Doctors')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={specialityData}
        renderItem={renderSpeciality}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 0.85,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  lastCardInRow: {
    marginRight: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  specialityText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SpecialityMenu;
