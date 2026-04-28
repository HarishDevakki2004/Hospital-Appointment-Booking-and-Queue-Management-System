import React, { useContext, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import axios from "axios";
// Note: TokenChip component needs to be copied to admin folder or shared
// For now, using a simple token display
const TokenChip = ({ index, status, isCurrent, estimatedStart }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED': return 'bg-gray-200 dark:bg-gray-700';
      case 'IN_PROGRESS': return 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500';
      case 'BOOKED': return 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500';
      case 'AVAILABLE': return 'bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className={`p-3 rounded-lg text-center ${getStatusColor()} ${isCurrent ? 'ring-2 ring-primary animate-pulse' : ''}`}>
      <div className="font-bold text-lg">{index}</div>
      {estimatedStart && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {new Date(estimatedStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
  FiCalendar,
  FiX,
} from "react-icons/fi";

const SlotQueueManagement = () => {
  const { dToken, backendUrl } = useContext(DoctorContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMarkingWrong, setIsMarkingWrong] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [actualDuration, setActualDuration] = useState('');
  const [servingTimers, setServingTimers] = useState({}); // Track serving timers

  useEffect(() => {
    if (dToken) {
      fetchSlots();
    }
  }, [dToken, selectedDate]);

  const fetchSlots = useCallback(async () => {
    if (!dToken) return;
    setIsLoading(true);
    try {
      const doctorId = JSON.parse(atob(dToken.split('.')[1])).id;
      const { data } = await axios.get(
        `${backendUrl}/api/availability/slots/${doctorId}?date=${selectedDate}`,
        { headers: { dToken } }
      );

      if (data.success) {
        setSlots(data.slots);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load slots');
    } finally {
      setIsLoading(false);
    }
  }, [dToken, backendUrl, selectedDate]);

  const fetchQueueData = useCallback(async () => {
    if (!selectedSlot?._id || !dToken) return;
    setIsLoadingQueue(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/slot-queue/${selectedSlot._id}`,
        { headers: { dToken } }
      );

      if (data.success) {
        setQueueData(data.queueSnapshot);
        // Set appointments sorted by token index
        if (data.queueSnapshot.appointments) {
          const sortedAppointments = [...data.queueSnapshot.appointments].sort(
            (a, b) => a.slotTokenIndex - b.slotTokenIndex
          );
          setAppointments(sortedAppointments);
        } else {
          setAppointments([]);
        }
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
      toast.error('Failed to load queue data');
    } finally {
      setIsLoadingQueue(false);
    }
  }, [selectedSlot?._id, dToken, backendUrl]);

  useEffect(() => {
    if (dToken) {
      fetchSlots();
    }
  }, [dToken, selectedDate, fetchSlots]);

  useEffect(() => {
    if (selectedSlot?._id) {
      fetchQueueData();
    } else {
      setQueueData(null);
    }
  }, [selectedSlot?._id, fetchQueueData]);

  // Update serving timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (appointments.length > 0) {
        const updatedTimers = {};
        appointments.forEach((apt) => {
          if (apt.status === 'SERVING' && apt.servingStartedAt) {
            const elapsedMs = Date.now() - apt.servingStartedAt;
            const elapsedSec = Math.floor(elapsedMs / 1000);
            const minutes = Math.floor(elapsedSec / 60);
            const seconds = elapsedSec % 60;
            updatedTimers[apt._id] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          }
        });
        if (Object.keys(updatedTimers).length > 0) {
          setServingTimers(updatedTimers);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [appointments]);

  // Format time from timestamp
  const formatTimeFromTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Format time from time string (HH:MM)
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Start serving an appointment
  // Start serving session for the queue (one-time operation)
  const handleStartSession = async () => {
    if (!selectedSlot?._id) {
      toast.error('No slot selected');
      return;
    }

    if (window.confirm('Are you sure you want to start the serving session? This will begin serving the first waiting patient.')) {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/slot-queue/queues/${selectedSlot._id}/start_session`,
          {},
          { headers: { dToken } }
        );

        if (data.success) {
          toast.success('Serving session started successfully');
          fetchQueueData();
          fetchSlots();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('Error starting session:', error);
        if (error.response?.status === 409) {
          toast.error('The serving session has already been started for this queue.');
        } else {
          toast.error(error.response?.data?.message || 'Failed to start session');
        }
      }
    }
  };

  // Deprecated: Per-patient start serving (kept for backward compatibility but not used in UI)
  const handleStartServing = async (appointment) => {
    if (!appointment || !appointment._id) {
      toast.warning('Invalid appointment');
      return;
    }

    if (window.confirm(`Are you sure you want to start serving token #${appointment.slotTokenIndex}?`)) {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/slot-queue/appointments/${appointment._id}/start_serving`,
          {},
          { headers: { dToken } }
        );

        if (data.success) {
          toast.success('Started serving appointment');
          fetchQueueData();
          fetchSlots();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('Error starting serving:', error);
        toast.error(error.response?.data?.message || 'Failed to start serving');
      }
    }
  };

  // Mark appointment as completed
  const handleMarkCompleted = async (appointment) => {
    if (!appointment || !appointment._id) {
      toast.warning('Invalid appointment');
      return;
    }

    // Check if appointment is currently being served
    if (appointment.status !== 'SERVING') {
      toast.warning(`This appointment is not currently being served. Current status: ${appointment.status}`);
      return;
    }

    setIsCompleting(true);
    try {
      const duration = actualDuration ? parseInt(actualDuration) : null;
      const { data } = await axios.post(
        `${backendUrl}/api/slot-queue/mark-completed`,
        {
          appointmentId: appointment._id,
          actualDuration: duration
        },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success('Token marked as completed');
        setActualDuration('');
        fetchQueueData();
        fetchSlots();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error marking completed:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as completed');
    } finally {
      setIsCompleting(false);
    }
  };

  // Mark appointment as wrong
  const handleMarkWrong = async (appointment) => {
    if (!appointment || !appointment._id) {
      toast.warning('Invalid appointment');
      return;
    }

    // Check if appointment is currently being served (optional - can cancel any appointment)
    // But warn if it's not the serving one
    if (appointment.status === 'SERVING' && queueData.servingAppointmentId !== appointment._id) {
      toast.warning(`This is not the current serving appointment.`);
      return;
    }

    if (window.confirm(`Are you sure you want to mark Token #${appointment.slotTokenIndex} as wrong? This will skip to the next token.`)) {
      setIsMarkingWrong(true);
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/slot-queue/mark-wrong`,
          {
            appointmentId: appointment._id,
          },
          { headers: { dToken } }
        );

        if (data.success) {
          toast.success('Token marked as wrong and skipped');
          fetchQueueData();
          fetchSlots();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('Error marking wrong:', error);
        toast.error(error.response?.data?.message || 'Failed to mark as wrong');
      } finally {
        setIsMarkingWrong(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Slot Queue Management
        </h1>
        <button
          onClick={fetchSlots}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No slots found for this date</p>
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
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer select-none"
                onClick={() => {
                  if (isLoadingQueue) return; // Prevent clicks while loading
                  const newSelected = selectedSlot?._id === slot._id ? null : slot;
                  setSelectedSlot(newSelected);
                  if (!newSelected) {
                    setQueueData(null);
                  }
                }}
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
                      {slot.totalTokens} tokens | Current: {slot.currentToken}
                    </p>
                    <p className="text-xs opacity-75">
                      Avg: {slot.averageConsultationTime} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Queue Details (Expanded) */}
              <AnimatePresence>
                {selectedSlot?._id === slot._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-6"
                  >
                    {queueData ? (
                      <>
                        {/* Start Session Button - Show only if session not started */}
                        {!queueData.servingSessionStarted && (
                          <button
                            onClick={handleStartSession}
                            className="w-full mb-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            ▶ Start Serving Session
                          </button>
                        )}

                        {/* Queue Statistics */}
                        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                              {queueData.totalTokens}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                              {queueData.currentToken}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Token</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                              {Math.max(0, queueData.totalTokens - queueData.currentToken)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                          </div>
                        </div>

                        {/* Slot Info */}
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            📅 Date: {queueData.date}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            ⏰ Time: {queueData.startTime} - {queueData.endTime}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            ⏱️ Avg Time: {queueData.averageConsultationTime} min
                          </p>
                        </div>

                        {/* Appointments List */}
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Appointments (Sorted by Token Order)
                          </h4>
                          {appointments.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <p className="text-gray-500 dark:text-gray-400">No appointments booked for this slot</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {appointments.map((item) => {
                                const isCurrent = item.status === 'SERVING' || item._id === queueData.servingAppointmentId;
                                const isServing = item.status === 'SERVING';
                                const isInProgress = item.status === 'IN_PROGRESS';
                                const isCompleted = item.status === 'COMPLETED';
                                const isWaiting = item.status === 'BOOKED' || item.status === 'WAITING';
                                const userData = item.userData || {};
                                
                                // Get elapsed time from timer state or calculate
                                const elapsedTime = servingTimers && servingTimers[item._id] ? servingTimers[item._id] : 
                                  (isServing && item.servingStartedAt ? (() => {
                                    try {
                                      const elapsedMs = Date.now() - item.servingStartedAt;
                                      const elapsedSec = Math.floor(elapsedMs / 1000);
                                      const minutes = Math.floor(elapsedSec / 60);
                                      const seconds = elapsedSec % 60;
                                      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                    } catch (e) {
                                      return null;
                                    }
                                  })() : null);

                                return (
                                  <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-lg border-2 ${
                                      isCurrent
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                        : isCompleted
                                        ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-70'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    {/* Appointment Header */}
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                                        Token #{item.slotTokenIndex}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                          isServing
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : isInProgress
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                            : isCompleted
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                          {isServing ? 'Serving' :
                                           item.status === 'IN_PROGRESS' ? 'In Progress' :
                                           item.status === 'COMPLETED' ? 'Completed' : 'Booked'}
                                        </div>
                                        {isServing && elapsedTime && (
                                          <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                                            ⏱️ {elapsedTime}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="mb-3 space-y-1">
                                      <p className="font-semibold text-gray-800 dark:text-white">
                                        👤 {userData.name || 'Unknown Patient'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        📧 {userData.email || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        📞 {userData.phone || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        ⏰ Est. Start: {formatTimeFromTimestamp(item.estimatedStart)}
                                      </p>
                                      {item.actualConsultDuration && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          ⏱️ Duration: {item.actualConsultDuration} min
                                        </p>
                                      )}
                                    </div>

                                    {/* Action Buttons - Show when serving (no per-patient start button) */}
                                    {isServing && (
                                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                                        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 text-center">
                                          🎯 Currently Serving This Token
                                        </p>
                                        <div className="mb-3">
                                          <input
                                            type="number"
                                            value={actualDuration}
                                            onChange={(e) => setActualDuration(e.target.value)}
                                            placeholder="Actual duration (minutes)"
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                          />
                                        </div>
                                        <div className="flex gap-3">
                                          <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleMarkCompleted(item)}
                                            disabled={isCompleting || isMarkingWrong}
                                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-green-600 transition-colors"
                                          >
                                            {isCompleting ? 'Completing...' : '✓ Completed'}
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleMarkWrong(item)}
                                            disabled={isMarkingWrong || isCompleting}
                                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-red-600 transition-colors"
                                          >
                                            {isMarkingWrong ? 'Processing...' : '✗ Wrong'}
                                          </motion.button>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    ) : isLoadingQueue ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Loading queue data...</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No queue data available</p>
                      </div>
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

export default SlotQueueManagement;

