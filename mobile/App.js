import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppContextProvider from './src/context/AppContext';
import DoctorContextProvider from './src/context/DoctorContext';
import AdminContextProvider from './src/context/AdminContext';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <AppContextProvider>
      <DoctorContextProvider>
        <AdminContextProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AdminContextProvider>
      </DoctorContextProvider>
    </AppContextProvider>
  );
}
