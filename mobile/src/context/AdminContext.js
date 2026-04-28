import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE } from '../config';

export const AdminContext = createContext();

const AdminContextProvider = (props) => {

    const [aToken, setATokenState] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [dashData, setDashData] = useState(false);
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
            const storedToken = await AsyncStorage.getItem('aToken');
            if (storedToken && isValidToken(storedToken)) {
                // Validate token with backend
                try {
                    const { data } = await axios.get(API_BASE + '/api/admin/dashboard', {
                        headers: { aToken: storedToken }
                    });
                    if (data.success) {
                        setATokenState(storedToken);
                        setDashData(data.dashData);
                    } else {
                        // Invalid token, clear it
                        await AsyncStorage.removeItem('aToken');
                        setATokenState(null);
                        setDashData(false);
                    }
                } catch (error) {
                    // Token validation failed, clear it
                    await AsyncStorage.removeItem('aToken');
                    setATokenState(null);
                    setDashData(false);
                }
            } else {
                // No token or invalid format, clear it
                if (storedToken) {
                    await AsyncStorage.removeItem('aToken');
                }
                setATokenState(null);
                setDashData(false);
            }
        } catch (error) {
            console.error('Error loading aToken:', error);
            setATokenState(null);
            setDashData(false);
        } finally {
            setLoading(false);
        }
    };

    const setAToken = async (newToken) => {
        try {
            if (newToken) {
                await AsyncStorage.setItem('aToken', newToken);
            } else {
                await AsyncStorage.removeItem('aToken');
            }
            setATokenState(newToken);
        } catch (error) {
            console.error('Error saving aToken:', error);
        }
    };

    // SAME LOGIC AS WEB - Get all doctors
    const getAllDoctors = async () => {
        try {
            const { data } = await axios.get(API_BASE + '/api/admin/all-doctors', { 
                headers: { aToken } 
            });
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    // SAME LOGIC AS WEB - Change doctor availability
    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(
                API_BASE + '/api/admin/change-availability', 
                { docId }, 
                { headers: { aToken } }
            );
            if (data.success) {
                Alert.alert('Success', data.message);
                getAllDoctors();
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', error.message);
        }
    };

    // SAME LOGIC AS WEB - Get all appointments
    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(API_BASE + '/api/admin/appointments', { 
                headers: { aToken } 
            });
            if (data.success) {
                setAppointments(data.appointments.reverse());
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
                API_BASE + '/api/admin/cancel-appointment', 
                { appointmentId }, 
                { headers: { aToken } }
            );

            if (data.success) {
                Alert.alert('Success', data.message);
                getAllAppointments();
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
            const { data } = await axios.get(API_BASE + '/api/admin/dashboard', { 
                headers: { aToken } 
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

    const value = {
        aToken,
        setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        getAllAppointments,
        appointments,
        setAppointments,
        cancelAppointment,
        dashData,
        getDashData,
        loading,
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;


