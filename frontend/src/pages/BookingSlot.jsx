import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import TokenChip from '../components/TokenChip';
import { getTravelTime, getUserLocation } from '../utils/getTravelTime';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiClock, FiMapPin, FiCalendar, FiNavigation, FiCreditCard } from 'react-icons/fi';
import useQueueSocket from '../hooks/useQueueSocket';

const BookingSlot = () => {
    const { doctorId } = useParams();
    const { backendUrl, token, doctors } = useContext(AppContext);
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedTokenIndex, setSelectedTokenIndex] = useState(null);
    const [travelTime, setTravelTime] = useState(null);
    const [travelDistance, setTravelDistance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [docInfo, setDocInfo] = useState(null);
    const [bookedAppointment, setBookedAppointment] = useState(null);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Initialize selected date to today
    useEffect(() => {
        setSelectedDate(today);
    }, [today]);

    // Get doctor info
    useEffect(() => {
        if (doctors.length > 0) {
            const doc = doctors.find(d => d._id === doctorId);
            setDocInfo(doc);
        }
    }, [doctors, doctorId]);

    // Calculate travel time when doctor info is available
    useEffect(() => {
        if (docInfo && docInfo.location && docInfo.location.latitude) {
            calculateTravelTime();
        }
    }, [docInfo]);

    // Fetch slots for selected date
    useEffect(() => {
        if (selectedDate && doctorId) {
            fetchSlots();
        }
    }, [selectedDate, doctorId]);

    // Subscribe to queue updates for selected slot
    const { queueData } = useQueueSocket(
        selectedSlot?._id || null,
        null, // userId - will be set after booking
        backendUrl
    );

    // Update slots when queue data changes
    useEffect(() => {
        if (queueData && selectedSlot) {
            // Update the selected slot with new queue data
            setSlots(prevSlots => 
                prevSlots.map(slot => 
                    slot._id === queueData.slotId 
                        ? { ...slot, ...queueData, tokens: queueData.tokens }
                        : slot
                )
            );
        }
    }, [queueData, selectedSlot]);

    const calculateTravelTime = async () => {
        if (!docInfo?.location?.latitude) return;

        try {
            const userLoc = await getUserLocation();
            const doctorLoc = {
                lat: docInfo.location.latitude,
                lng: docInfo.location.longitude
            };

            const result = await getTravelTime(userLoc, doctorLoc);
            setTravelTime(result.duration);
            setTravelDistance(result.distance);
        } catch (error) {
            console.error('Travel time calculation error:', error);
            setTravelTime(15); // Fallback
        }
    };

    const fetchSlots = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/availability/slots/${doctorId}?date=${selectedDate}`
            );

            if (data.success) {
                setSlots(data.slots);
            } else {
                toast.error(data.message || 'Failed to load slots');
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            toast.error('Failed to load available slots');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookToken = async () => {
        if (!token) {
            toast.warning('Please login to book an appointment');
            return navigate('/login');
        }

        if (!selectedSlot || !selectedTokenIndex) {
            toast.warning('Please select a slot and token');
            return;
        }

        setIsBooking(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/booking/book-slot-token`,
                {
                    slotId: selectedSlot._id,
                    travelTime: travelTime || 15
                },
                { headers: { token } }
            );

            if (data.success) {
                setBookedAppointment(data.appointment);
                toast.success(`Token #${data.appointment.slotTokenIndex} booked successfully!`);
            } else {
                toast.error(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setIsBooking(false);
        }
    };

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handlePayOnline = async () => {
        if (!bookedAppointment?._id) {
            toast.error('Appointment ID not found');
            return;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/payment-razorpay`,
                { appointmentId: bookedAppointment._id },
                { headers: { token } }
            );

            if (data.success) {
                initPay(data.order);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        }
    };

    const initPay = (order) => {
        const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        if (!razorpayKeyId) {
            toast.error("Razorpay is not configured. Please contact support.");
            return;
        }

        const options = {
            key: razorpayKeyId,
            amount: order.amount,
            currency: order.currency,
            name: "MediQ Appointment",
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(
                        `${backendUrl}/api/user/verifyRazorpay`,
                        response,
                        { headers: { token } }
                    );
                    if (data.success) {
                        toast.success("Payment successful!");
                        setBookedAppointment(null);
                        setTimeout(() => {
                            navigate('/my-appointments');
                        }, 1500);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error(error.message);
                }
            },
            theme: { color: "#4f46e5" },
        };
        
        try {
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Razorpay initialization error:", error);
            toast.error("Failed to initialize payment. Please try again.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8"
        >
            {/* Back Button */}
            <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-6"
            >
                <FiArrowLeft className="text-lg" />
                <span>Back</span>
            </motion.button>

            {/* Doctor Info */}
            {docInfo && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
                >
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {docInfo.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {docInfo.speciality}
                    </p>
                </motion.div>
            )}

            {/* Date Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Date
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Travel Time Display */}
            {travelTime && (
                <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-cyan-50 dark:from-primary/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <FiNavigation className="text-primary" />
                            <span className="font-medium">Travel Time:</span>
                        </div>
                        <span className="text-xl font-bold text-primary">
                            {travelTime} minutes
                        </span>
                    </div>
                    {travelDistance && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Distance: {travelDistance} km
                        </div>
                    )}
                </div>
            )}

            {/* Slots Display */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : slots.length === 0 ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                    <p className="text-yellow-800 dark:text-yellow-200">
                        No available slots for this date
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {slots.map((slot) => (
                        <motion.div
                            key={slot._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Slot Header */}
                            <div
                                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer"
                                onClick={() => setSelectedSlot(selectedSlot?._id === slot._id ? null : slot)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {slot.slotPeriod} Slot
                                        </h3>
                                        <p className="text-sm opacity-90">
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm opacity-90">
                                            {slot.totalTokens} / {slot.capacity || '∞'} tokens
                                        </p>
                                        <p className="text-xs opacity-75">
                                            Avg: {slot.averageConsultationTime} min
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Token Chips (Expanded) */}
                            <AnimatePresence>
                                {selectedSlot?._id === slot._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-6"
                                    >
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                            Select a Token:
                                        </h4>
                                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                                            {(slot.tokens || []).map((token) => (
                                                <TokenChip
                                                    key={token.index}
                                                    index={token.index}
                                                    status={token.status}
                                                    isCurrent={token.index === slot.currentToken + 1 && token.status === 'IN_PROGRESS'}
                                                    estimatedStart={token.estimatedStart}
                                                    onClick={
                                                        token.status === 'AVAILABLE'
                                                            ? () => setSelectedTokenIndex(token.index)
                                                            : null
                                                    }
                                                />
                                            ))}
                                        </div>

                                        {/* Book Button */}
                                        {selectedTokenIndex && selectedSlot._id === slot._id && !bookedAppointment && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleBookToken}
                                                disabled={isBooking}
                                                className="mt-6 w-full px-6 py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50"
                                            >
                                                {isBooking ? 'Booking...' : `Book Token #${selectedTokenIndex}`}
                                            </motion.button>
                                        )}

                                        {/* Booking Success Message */}
                                        {bookedAppointment && selectedSlot._id === slot._id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg"
                                            >
                                                <div className="text-center mb-4">
                                                    <div className="text-4xl mb-2">✅</div>
                                                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                                                        Appointment Booked Successfully!
                                                    </h3>
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                                            Token #{bookedAppointment.slotTokenIndex}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Estimated time for your turn: <span className="font-bold text-primary text-lg">{bookedAppointment.estimatedTime || 'N/A'}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            (Based on {bookedAppointment.averageConsultationTime || 10} min per patient)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handlePayOnline}
                                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90"
                                                    >
                                                        <FiCreditCard />
                                                        Pay Online (₹{bookedAppointment.amount || 0})
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => {
                                                            setBookedAppointment(null);
                                                            navigate('/my-appointments');
                                                        }}
                                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                                                    >
                                                        View Appointments
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default BookingSlot;


