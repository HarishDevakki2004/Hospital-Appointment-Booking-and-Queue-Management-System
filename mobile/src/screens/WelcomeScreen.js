import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>MediQ Mobile</Text>
        <Text style={styles.tagline}>Your Health, Our Priority</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>Welcome to MediQ Mobile</Text>
        <Text style={styles.subtitle}>Choose your login option</Text>

        {/* Login Options */}
        <View style={styles.optionsContainer}>
          {/* Patient Login */}
          <TouchableOpacity
            style={[styles.optionCard, styles.patientCard]}
            onPress={() => navigation.navigate('PatientLogin')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <Text style={styles.optionTitle}>Patient</Text>
            <Text style={styles.optionDescription}>
              Book appointments, view queue, manage your health
            </Text>
          </TouchableOpacity>

          {/* Doctor Login */}
          <TouchableOpacity
            style={[styles.optionCard, styles.doctorCard]}
            onPress={() => navigation.navigate('DoctorLogin')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👨‍⚕️</Text>
            </View>
            <Text style={styles.optionTitle}>Doctor</Text>
            <Text style={styles.optionDescription}>
              Manage appointments, availability, and patient queue
            </Text>
          </TouchableOpacity>

          {/* Admin Login */}
          <TouchableOpacity
            style={[styles.optionCard, styles.adminCard]}
            onPress={() => navigation.navigate('AdminLogin')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👨‍💼</Text>
            </View>
            <Text style={styles.optionTitle}>Admin</Text>
            <Text style={styles.optionDescription}>
              Manage doctors, appointments, and system settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Secure • Reliable • Easy to Use
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#dbeafe',
  },
  mainContent: {
    padding: 20,
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patientCard: {
    borderColor: '#3b82f6',
  },
  doctorCard: {
    borderColor: '#10b981',
  },
  adminCard: {
    borderColor: '#f59e0b',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 48,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default WelcomeScreen;

