import { createContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE } from '../config';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

    const [dToken, setDTokenState] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);
    const [loading, setLoading] = useState(true);

    // Validate token helper
    const isValidToken = (tokenValue) => {
        if (!tokenValue) return false;
        const trimmed = tokenValue.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.length < 10) {
            return false;
        }
        return true;
    };

    // Load and validate token from storage
    useEffect(() => {
        loadToken();
    }, []);

    const loadToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('dToken');
            if (storedToken && isValidToken(storedToken)) {
                // Validate token with backend
                try {
                    const { data } = await axios.get(API_BASE + '/api/doctor/profile', {
                        headers: { dToken: storedToken }
                    });
                    if (data.success) {
                        setDTokenState(storedToken);
                        setProfileData(data.profileData);
                    } else {
                        // Invalid token, clear it
                        await AsyncStorage.removeItem('dToken');
                        setDTokenState(null);
                        setProfileData(false);
                    }
                } catch (error) {
                    // Token validation failed, clear it
                    await AsyncStorage.removeItem('dToken');
                    setDTokenState(null);
                    setProfileData(false);
                }
            } else {
                // No token or invalid format, clear it
                if (storedToken) {
                    await AsyncStorage.removeItem('dToken');
                }
                setDTokenState(null);
                setProfileData(false);
            }
        } catch (error) {
            console.error('Error loading dToken:', error);
            setDTokenState(null);
            setProfileData(false);
        } finally {
            setLoading(false);
        }
    };

    const setDToken = async (newToken) => {
        try {
            if (newToken) {
                await AsyncStorage.setItem('dToken', newToken);
            } else {
                await AsyncStorage.removeItem('dToken');
            }
            setDTokenState(newToken);
        } catch (error) {
            console.error('Error saving dToken:', error);
        }
    };

    // SAME LOGIC AS WEB - Getting Doctor appointment data
    const getAppointments = async () => {
        try {
            const { data } = await axios.get(API_BASE + '/api/doctor/appointments', { 
                headers: { dToken } 
            });

            if (data.success) {
                setAppointments(data.appointments.reverse());
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', error.message);
        }
    };

    // SAME LOGIC AS WEB - Mark appointment completed
    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                API_BASE + '/api/doctor/complete-appointment', 
                { appointmentId }, 
                { headers: { dToken } }
            );

            if (data.success) {
                Alert.alert('Success', data.message);
                getAppointments();
                getDashData();
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
            console.log(error);
        }
    };

    // SAME LOGIC AS WEB - Cancel appointment
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                API_BASE + '/api/doctor/cancel-appointment', 
                { appointmentId }, 
                { headers: { dToken } }
            );

            if (data.success) {
                Alert.alert('Success', data.message);
                getAppointments();
                getDashData();
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
            console.log(error);
        }
    };

    // SAME LOGIC AS WEB - Get dashboard data
    const getDashData = async () => {
        try {
            const { data } = await axios.get(API_BASE + '/api/doctor/dashboard', { 
                headers: { dToken } 
            });

            if (data.success) {
                setDashData(data.dashData);
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', error.message);
        }
    };

    // SAME LOGIC AS WEB - Get profile data
    const getProfileData = async () => {
        try {
            const { data } = await axios.get(API_BASE + '/api/doctor/profile', { 
                headers: { dToken } 
            });
            console.log('Fetched profile data:', data.profileData);
            console.log('Profile phone:', data.profileData?.phone);
            if (data.success && data.profileData) {
                setProfileData(data.profileData);
            }
        } catch (error) {
            console.log('Error fetching profile:', error);
            Alert.alert('Error', error.message);
        }
    };

    const value = {
        dToken,
        setDToken,
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        setDashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData,
        loading,
    };

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;


