import React, { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import TokenChip from "../components/TokenChip";
import useQueueSocket from "../hooks/useQueueSocket";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiX,
  FiCheck,
  FiDollarSign,
  FiLoader,
  FiNavigation,
  FiExternalLink,
  FiUsers,
} from "react-icons/fi";

const MyAppointmentsEnhanced = () => {
  const { backendUrl, token, getDoctorsData, userId } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [queueData, setQueueData] = useState({});

  const months = [
    " ", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return "";
    // Handle both formats: "15_1_2024" and "2024-01-15"
    if (slotDate.includes("_")) {
      const dateArray = slotDate.split("_");
      return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
    } else {
      const date = new Date(slotDate);
      return `${date.getDate()} ${months[date.getMonth() + 1]} ${date.getFullYear()}`;
    }
  };

  // Countdown timer hook
  const useCountdown = (targetTime) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
      if (!targetTime) {
        setTimeLeft(null);
        return;
      }

      const updateCountdown = () => {
        const now = Date.now();
        const diff = targetTime - now;

        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true });
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds, isPast: false });
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    }, [targetTime]);

    return timeLeft;
  };

  // Get user appointments
  const getUserAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/booking/my-appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
        
        // Subscribe to queue updates for each slot-based appointment
        data.appointments.forEach(apt => {
          if (apt.slotId) {
            // Queue subscription handled by useQueueSocket in component
          }
        });
      }
    } catch (error) {
      console.error(error);
      // Fallback to legacy endpoint
      try {
        const { data } = await axios.get(backendUrl + "/api/user/appointments", {
          headers: { token },
        });
        setAppointments(data.appointments.reverse());
      } catch (err) {
        toast.error("Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to queue updates for expanded appointment
  const { queueData: socketQueueData } = useQueueSocket(
    expandedAppointment?.slotId || null,
    userId || null,
    backendUrl
  );

  useEffect(() => {
    if (socketQueueData && expandedAppointment) {
      setQueueData(prev => ({
        ...prev,
        [expandedAppointment.slotId]: socketQueueData
      }));
    }
  }, [socketQueueData, expandedAppointment]);

  // Fetch queue data for slot
  const fetchQueueData = async (slotId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/slot-queue/${slotId}`);
      if (data.success) {
        setQueueData(prev => ({
          ...prev,
          [slotId]: data.queueSnapshot
        }));
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
    }
  };

  useEffect(() => {
    if (expandedAppointment?.slotId) {
      fetchQueueData(expandedAppointment.slotId);
    }
  }, [expandedAppointment]);

  const cancelAppointment = async (appointmentId) => {
    setCancellingId(appointmentId);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const initPay = (order) => {
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKeyId) {
      toast.error("Razorpay is not configured. Please contact support.");
      console.error("VITE_RAZORPAY_KEY_ID is missing in environment variables");
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
            backendUrl + "/api/user/verifyRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            getUserAppointments();
            toast.success("Payment successful!");
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

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f172a] dark:to-[#1e293b] py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Appointments
          </h1>
          <div className="w-20 h-1 bg-primary rounded-full"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't booked any appointments yet
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/doctors")}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium"
            >
              Book an Appointment
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {appointments.map((item, index) => {
              const isExpanded = expandedAppointment?._id === item._id;
              const slotQueue = queueData[item.slotId] || null;
              const userToken = item.slotTokenIndex;
              const currentToken = slotQueue?.currentToken || item.slot?.currentToken || 0;
              const positionInQueue = userToken ? Math.max(0, userToken - currentToken) : null;
              const countdown = useCountdown(item.estimatedStart);

              return (
                <motion.div
                  key={item._id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 lg:w-1/5 relative">
                      <motion.img
                        src={item.docData.image}
                        alt={item.docData.name}
                        className="w-full h-48 md:h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      {item.cancelled && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-red-500 text-sm font-medium shadow">
                            Cancelled
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                            {item.docData.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {item.docData.speciality}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="text-primary" />
                              <span>{slotDateFormat(item.slotDate)}</span>
                            </div>
                            {item.slotTime && (
                              <div className="flex items-center gap-1">
                                <FiClock className="text-primary" />
                                <span>{item.slotTime}</span>
                              </div>
                            )}
                            {item.slotPeriod && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                                {item.slotPeriod}
                              </span>
                            )}
                          </div>

                          {/* Token and Position Info */}
                          {userToken && (
                            <div className="mb-4 space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-lg font-bold">
                                  Token #{userToken}
                                </span>
                                {positionInQueue !== null && positionInQueue > 0 && (
                                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                                    #{positionInQueue} in queue
                                  </span>
                                )}
                                {positionInQueue === 0 && (
                                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                    Your Turn!
                                  </span>
                                )}
                              </div>

                              {/* Countdown Timer */}
                              {item.estimatedStart && countdown && !countdown.isPast && (
                                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-cyan-50 dark:from-primary/20 dark:to-cyan-900/20 rounded-lg">
                                  <FiClock className="text-primary" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Estimated start in:</span>
                                  <span className="text-xl font-bold text-primary font-mono">
                                    {String(countdown.hours).padStart(2, '0')}:
                                    {String(countdown.minutes).padStart(2, '0')}:
                                    {String(countdown.seconds).padStart(2, '0')}
                                  </span>
                                </div>
                              )}

                              {item.estimatedStart && countdown && countdown.isPast && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Your estimated time has passed. Please check with the clinic.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Travel Time */}
                          {item.travelTime && (
                            <div className="flex items-center gap-1 text-sm text-primary font-medium mb-2">
                              <FiNavigation className="text-primary" />
                              <span>Travel Time: {item.travelTime} minutes</span>
                            </div>
                          )}

                          {/* Google Maps Link */}
                          {item.docData.location?.latitude && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${item.docData.location.latitude},${item.docData.location.longitude}`;
                                window.open(url, '_blank');
                              }}
                              className="mt-2 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                              <FiExternalLink />
                              Open in Google Maps
                            </motion.button>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {item.isCompleted ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <FiCheck className="mr-1" /> Completed
                            </span>
                          ) : item.cancelled ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              <FiX className="mr-1" /> Cancelled
                            </span>
                          ) : item.payment ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              <FiCheck className="mr-1" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Pending Payment
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Queue Visualization (Expanded) */}
                      <AnimatePresence>
                        {isExpanded && slotQueue && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                          >
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                              <FiUsers className="text-primary" />
                              Live Queue
                            </h4>
                            
                            {/* Progress Bar for Current Token */}
                            {slotQueue.currentToken > 0 && slotQueue.tokens[slotQueue.currentToken - 1] && (
                              <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  <span>Current Token: #{slotQueue.currentToken}</span>
                                  <span>Avg: {slotQueue.averageConsultationTime} min</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <motion.div
                                    className="bg-primary h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '50%' }}
                                    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Token Chips Grid */}
                            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                              {slotQueue.tokens?.map((token) => (
                                <TokenChip
                                  key={token.index}
                                  index={token.index}
                                  status={token.status}
                                  isCurrent={token.index === slotQueue.currentToken + 1 && token.status === 'IN_PROGRESS'}
                                  isUserToken={token.index === userToken}
                                  estimatedStart={token.estimatedStart}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 mt-6">
                        {/* View Queue Button */}
                        {item.slotId && !item.cancelled && !item.isCompleted && (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setExpandedAppointment(isExpanded ? null : item)}
                            className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm flex items-center gap-2"
                          >
                            <FiUsers />
                            {isExpanded ? 'Hide' : 'View'} Queue
                          </motion.button>
                        )}

                        {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setPayment(item._id)}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm"
                          >
                            Pay Online
                          </motion.button>
                        )}

                        {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => appointmentRazorpay(item._id)}
                            className="px-4 py-2 bg-white border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-sm flex items-center gap-2"
                          >
                            <img src={assets.razorpay_logo} alt="Razorpay" className="h-5 object-contain" />
                            Pay Now
                          </motion.button>
                        )}

                        {!item.cancelled && !item.isCompleted && (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => cancelAppointment(item._id)}
                            disabled={cancellingId === item._id}
                            className={`px-4 py-2 border rounded-lg font-medium text-sm ${
                              cancellingId === item._id
                                ? "border-gray-300 text-gray-400 dark:border-gray-700 dark:text-gray-600"
                                : "border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            } flex items-center gap-2`}
                          >
                            {cancellingId === item._id ? (
                              <>
                                <FiLoader className="animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <FiX />
                                Cancel
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyAppointmentsEnhanced;


