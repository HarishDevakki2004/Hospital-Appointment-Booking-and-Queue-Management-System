import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import { globalStyles } from '../../utils/globalStyles';
import Header from '../../components/Header';
import SpecialityMenu from '../../components/SpecialityMenu';
import TopDoctors from '../../components/TopDoctors';
import Reviews from '../../components/Reviews';
import Banner from '../../components/Banner';
import NotificationsScreen from '../../components/NotificationsScreen';

const PatientHomeScreen = ({ navigation }) => {
  const { getDoctorsData } = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    getDoctorsData();
  }, []);

  const quickActions = [
    { icon: '📅', label: 'Appointments', screen: 'Appointments' },
    { icon: '👤', label: 'Profile', screen: 'Profile' },
  ];

  return (
    <>
      <ScrollView 
        style={[globalStyles.container, styles.container]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[globalStyles.py4, styles.contentContainer]}
      >
        <Header onNotificationPress={() => setShowNotifications(true)} />
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <SpecialityMenu />
        <TopDoctors />
        <Reviews />
        <Banner />
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Notifications Modal */}
      <NotificationsScreen
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default PatientHomeScreen;
