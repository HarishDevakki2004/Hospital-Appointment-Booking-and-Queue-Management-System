import React, { useContext, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { AppContext } from '../context/AppContext';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import MedicalAssistantWrapper from '../components/MedicalAssistantWrapper';

// Login Screens
import PatientLoginScreen from '../screens/PatientLoginScreen';
import DoctorLoginScreen from '../screens/DoctorLoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';

// Patient Screens
import PatientHomeScreen from '../screens/Patient/PatientHomeScreen';
import DoctorsListScreen from '../screens/Patient/DoctorsListScreen';
import DoctorProfileScreen from '../screens/Patient/DoctorProfileScreen';
import DoctorProfileScreenDoctor from '../screens/Doctor/DoctorProfileScreen';
import AppointmentScreen from '../screens/Patient/AppointmentScreen';
import MyAppointmentsScreen from '../screens/Patient/MyAppointmentsScreen';
import BookingSlotScreen from '../screens/Patient/BookingSlotScreen';
import MyProfileScreen from '../screens/Patient/MyProfileScreen';
import ProfileAppointmentsScreen from '../screens/Patient/ProfileAppointmentsScreen';
import AppointmentDetailsScreen from '../screens/Patient/AppointmentDetailsScreen';
import AboutScreen from '../screens/Patient/AboutScreen';
import ContactScreen from '../screens/Patient/ContactScreen';

// Doctor Screens
import DoctorHomeScreen from '../screens/Doctor/DoctorHomeScreen';
import DoctorAppointmentsScreen from '../screens/Doctor/DoctorAppointmentsScreen';
import AvailabilityManagementScreen from '../screens/Doctor/AvailabilityManagementScreen';
import SlotQueueManagementScreen from '../screens/Doctor/SlotQueueManagementScreen';

// Admin Screens
import AdminHomeScreen from '../screens/Admin/AdminHomeScreen';
import AdminDoctorsScreen from '../screens/Admin/AdminDoctorsScreen';
import AdminAppointmentsScreen from '../screens/Admin/AdminAppointmentsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Simple icon component
const TabIcon = ({ emoji }) => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

// Patient Tab Navigator
const PatientTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={PatientHomeScreen}
        options={{ 
          tabBarLabel: 'Home', 
          tabBarIcon: () => <TabIcon emoji="🏠" />
        }}
      />
      <Tab.Screen 
        name="Doctors" 
        component={DoctorsListScreen}
        options={{ 
          tabBarLabel: 'Doctors', 
          tabBarIcon: () => <TabIcon emoji="👨‍⚕️" />
        }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={MyAppointmentsScreen}
        options={{ 
          tabBarLabel: 'Appointments', 
          tabBarIcon: () => <TabIcon emoji="📅" />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={MyProfileScreen}
        options={{ 
          tabBarLabel: 'Profile', 
          tabBarIcon: () => <TabIcon emoji="👤" />
        }}
      />
    </Tab.Navigator>
  );
};

// Doctor Tab Navigator
const DoctorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DoctorHomeScreen}
        options={{ 
          tabBarLabel: 'Dashboard', 
          tabBarIcon: () => <TabIcon emoji="🏠" />
        }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={DoctorAppointmentsScreen}
        options={{ 
          tabBarLabel: 'Appointments', 
          tabBarIcon: () => <TabIcon emoji="📅" />
        }}
      />
      <Tab.Screen 
        name="Availability" 
        component={AvailabilityManagementScreen}
        options={{ 
          tabBarLabel: 'Availability', 
          tabBarIcon: () => <TabIcon emoji="⏰" />
        }}
      />
      <Tab.Screen 
        name="Queue" 
        component={SlotQueueManagementScreen}
        options={{ 
          tabBarLabel: 'Queue', 
          tabBarIcon: () => <TabIcon emoji="📋" />
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminHomeScreen}
        options={{ 
          tabBarLabel: 'Dashboard', 
          tabBarIcon: () => <TabIcon emoji="🏠" />
        }}
      />
      <Tab.Screen 
        name="Doctors" 
        component={AdminDoctorsScreen}
        options={{ 
          tabBarLabel: 'Doctors', 
          tabBarIcon: () => <TabIcon emoji="👨‍⚕️" />
        }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AdminAppointmentsScreen}
        options={{ 
          tabBarLabel: 'Appointments', 
          tabBarIcon: () => <TabIcon emoji="📅" />
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { token, loading: patientLoading } = useContext(AppContext);
  const { dToken, loading: doctorLoading } = useContext(DoctorContext);
  const { aToken, loading: adminLoading } = useContext(AdminContext);
  const navigationRef = useRef(null);

  // Navigate to appropriate screen when authentication state changes
  useEffect(() => {
    if (patientLoading || doctorLoading || adminLoading) return;
    
    if (navigationRef.current) {
      if (token) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'PatientTabs' }],
        });
      } else if (dToken) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'DoctorTabs' }],
        });
      } else if (aToken) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'AdminTabs' }],
        });
      } else {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'PatientLogin' }],
        });
      }
    }
  }, [token, dToken, aToken, patientLoading, doctorLoading, adminLoading]);

  // Show loading spinner while checking tokens
  if (patientLoading || doctorLoading || adminLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="PatientLogin"
      >
        {/* Always register login screens first - these are always available */}
        <Stack.Screen 
          name="PatientLogin" 
          component={PatientLoginScreen}
          options={{ title: 'Patient Login' }}
        />
        <Stack.Screen 
          name="DoctorLogin" 
          component={DoctorLoginScreen}
          options={{ title: 'Doctor Login' }}
        />
        <Stack.Screen 
          name="AdminLogin" 
          component={AdminLoginScreen}
          options={{ title: 'Admin Login' }}
        />

        {/* Patient screens - only accessible when logged in */}
        {token && (
          <>
            <Stack.Screen name="PatientTabs" component={PatientTabNavigator} />
            <Stack.Screen 
              name="DoctorProfile" 
              component={DoctorProfileScreen}
              options={{ presentation: 'card', title: 'Doctor Profile' }}
            />
            <Stack.Screen 
              name="Appointment" 
              component={AppointmentScreen}
              options={{ presentation: 'card', title: 'Book Appointment' }}
            />
            <Stack.Screen 
              name="BookingSlot" 
              component={BookingSlotScreen}
              options={{ presentation: 'card', title: 'Book Slot' }}
            />
            <Stack.Screen 
              name="About" 
              component={AboutScreen}
              options={{ presentation: 'card', title: 'About' }}
            />
            <Stack.Screen 
              name="Contact" 
              component={ContactScreen}
              options={{ presentation: 'card', title: 'Contact' }}
            />
            <Stack.Screen 
              name="ProfileAppointments" 
              component={ProfileAppointmentsScreen}
              options={{ presentation: 'card', title: 'Appointment History' }}
            />
            <Stack.Screen 
              name="AppointmentDetails" 
              component={AppointmentDetailsScreen}
              options={{ presentation: 'card', title: 'Appointment Details' }}
            />
          </>
        )}

          {/* Doctor screens - only accessible when logged in */}
          {dToken && (
            <>
              <Stack.Screen name="DoctorTabs" component={DoctorTabNavigator} />
              <Stack.Screen 
                name="DoctorProfile" 
                component={DoctorProfileScreenDoctor}
                options={{ presentation: 'card', title: 'My Profile' }}
              />
            </>
          )}

        {/* Admin screens - only accessible when logged in */}
        {aToken && (
          <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
        )}
      </Stack.Navigator>
      {/* Medical Assistant - only visible for logged-in patients, rendered inside NavigationContainer */}
      {token && <MedicalAssistantWrapper />}
    </NavigationContainer>
  );
};

export default AppNavigator;

