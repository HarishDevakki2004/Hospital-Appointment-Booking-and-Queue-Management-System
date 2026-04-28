import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from "react-toastify";

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000').replace(/\s+/g, '')

    const [doctors, setDoctors] = useState([])
    // Initialize token from localStorage, but validate it's not empty/null
    const getInitialToken = () => {
        try {
            const storedToken = localStorage.getItem('token')
            // Check if token exists and is valid (not empty, null, undefined, or "null" string)
            if (storedToken && 
                storedToken.trim() && 
                storedToken !== 'null' && 
                storedToken !== 'undefined' &&
                storedToken.length > 10) { // Basic validation - tokens are usually longer
                return storedToken
            }
            // Clear invalid token
            localStorage.removeItem('token')
            return false
        } catch (error) {
            console.error('Error reading token from localStorage:', error)
            localStorage.removeItem('token')
            return false
        }
    }
    const [token, setToken] = useState(false) // Start with false, validate on mount
    const [userData, setUserData] = useState(false)
    const [isLoading, setIsLoading] = useState(true) // Add loading state


    // Getting Doctors using API
    const getDoctorsData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    // Getting User Profile using API
    const loadUserProfileData = async (tokenToValidate = null) => {
        const tokenToUse = tokenToValidate || token
        if (!tokenToUse) {
            setUserData(false)
            return false
        }

        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token: tokenToUse } })

            if (data.success) {
                setUserData(data.userData)
                return true
            } else {
                // Token is invalid
                setUserData(false)
                return false
            }

        } catch (error) {
            console.log('Token validation failed:', error)
            setUserData(false)
            return false
        }
    }

    // Validate token on app load
    useEffect(() => {
        const validateTokenOnLoad = async () => {
            const storedToken = getInitialToken()
            
            if (storedToken) {
                // Try to validate token with backend
                const isValid = await loadUserProfileData(storedToken)
                
                if (isValid) {
                    // Token is valid and user data loaded, set it
                    setToken(storedToken)
                } else {
                    // Token is invalid or user data failed to load, clear it
                    console.log('Token validation failed, clearing token and showing login page')
                    localStorage.removeItem('token')
                    setToken(false)
                    setUserData(false)
                }
            } else {
                // No token, ensure it's cleared
                localStorage.removeItem('token')
                setToken(false)
                setUserData(false)
            }
            
            // Mark as loaded and fetch doctors
            setIsLoading(false)
            getDoctorsData()
        }

        validateTokenOnLoad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (token) {
            // Reload user profile when token changes (after login)
            loadUserProfileData().catch((error) => {
                // If profile load fails, token might be invalid
                console.error('Failed to load user profile:', error)
                // Clear invalid token and redirect to login
                localStorage.removeItem('token')
                setToken(false)
                setUserData(false)
            })
        } else {
            setUserData(false)
            // Ensure token is cleared
            localStorage.removeItem('token')
        }
    }, [token])

    // Extract userId from userData
    const userId = userData?._id || userData?.id || null;

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token')
        setToken(false)
        setUserData(false)
        toast.success('Logged out successfully')
    }

    const value = {
        doctors, getDoctorsData,
        currencySymbol,
        token, setToken,
        backendUrl, userData,
        setUserData, loadUserProfileData,
        userId, // Add userId to context
        handleLogout, // Add logout function
        isLoading, // Add loading state
    }

    

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider