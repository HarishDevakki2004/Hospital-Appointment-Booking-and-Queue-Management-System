import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { API_BASE } from '../config';

const Header = ({ onNotificationPress }) => {
  const navigation = useNavigation();
  const { userData } = useContext(AppContext);
  const [currentSpecialty, setCurrentSpecialty] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const specialties = ['Cardiologists', 'Dermatologists', 'Pediatricians', 'Neurologists'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpecialty((prev) => (prev + 1) % specialties.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [specialties.length]);

  const { token } = useContext(AppContext);

  // Fetch unread notification count
  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/notifications/unread-count`,
          { headers: { token } }
        ).catch(() => ({ data: { success: false, count: 0 } }));

        if (data.success) {
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        // Ignore errors
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {userData ? `Hi, ${userData.name?.split(' ')[0] || 'User'}` : 'Welcome'}
            </Text>
            <Text style={styles.subGreeting}>Find your doctor</Text>
          </View>
          
          {onNotificationPress && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={onNotificationPress}
              accessibilityLabel="View notifications"
              accessibilityHint="Shows your notifications"
              accessibilityRole="button"
            >
              <Text style={styles.notificationIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Doctors')}
            activeOpacity={0.8}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchText}>Search doctors, specialties...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.specialtyContainer}>
          <Text style={styles.specialtyLabel}>Book with</Text>
          <Text style={styles.specialtyText}>
            {specialties[currentSpecialty]}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3b82f6',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  content: {
    gap: 16,
  },
  greetingContainer: {
    marginTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#dbeafe',
    fontWeight: '500',
  },
  searchContainer: {
    marginTop: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: '#6b7280',
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  specialtyLabel: {
    fontSize: 14,
    color: '#dbeafe',
  },
  specialtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default Header;
