import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Banner = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Book Appointments</Text>
        <Text style={styles.subtitle}>With 100+ Trusted Doctors</Text>
        <Text style={styles.description}>
          Get instant access to top healthcare professionals
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Doctors')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Find Doctors</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#003543',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#67e8f9',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#dbeafe',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: '#003543',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Banner;
