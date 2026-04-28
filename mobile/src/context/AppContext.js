import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE } from '../config';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currencySymbol = '₹';
    
    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(false);
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

    // Load and validate token from storage on mount
    useEffect(() => {
        loadToken();
    }, []);

    const loadToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (storedToken && isValidToken(storedToken)) {
                // Validate token with backend
                try {
                    const { data } = await axios.get(API_BASE + '/api/user/get-profile', {
                        headers: { token: storedToken }
                    });
                    if (data.success) {
                        setToken(storedToken);
                        setUserData(data.userData);
                    } else {
                        // Invalid token, clear it
                        await AsyncStorage.removeItem('token');
                        setToken(null);
                        setUserData(false);
                    }
                } catch (error) {
                    // Token validation failed, clear it
                    await AsyncStorage.removeItem('token');
                    setToken(null);
                    setUserData(false);
                }
            } else {
                // No token or invalid format, clear it
                if (storedToken) {
                    await AsyncStorage.removeItem('token');
                }
                setToken(null);
                setUserData(false);
            }
        } catch (error) {
            console.error('Error loading token:', error);
            setToken(null);
            setUserData(false);
        } finally {
            setLoading(false);
        }
    };

    // Save token to storage
    const saveToken = async (newToken) => {
        try {
            if (newToken) {
                await AsyncStorage.setItem('token', newToken);
            } else {
                await AsyncStorage.removeItem('token');
            }
            setToken(newToken);
        } catch (error) {
            console.error('Error saving token:', error);
        }
    };

    // Getting Doctors using API - SAME LOGIC AS WEB
    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(API_BASE + '/api/doctor/list');
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', error.message);
        }
    };

    // Getting User Profile using API - SAME LOGIC AS WEB
    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(API_BASE + '/api/user/get-profile', { 
                headers: { token } 
            });

            if (data.success) {
                setUserData(data.userData);
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', error.message);
        }
    };

    useEffect(() => {
        getDoctorsData();
    }, []);

    useEffect(() => {
        if (token) {
            loadUserProfileData();
        } else {
            setUserData(false);
        }
    }, [token]);

    // Extract userId from userData - SAME AS WEB
    const userId = userData?._id || userData?.id || null;

    const value = {
        doctors, 
        getDoctorsData,
        currencySymbol,
        token, 
        setToken: saveToken, // Use saveToken wrapper
        userData,
        setUserData, 
        loadUserProfileData,
        userId,
        loading,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;

