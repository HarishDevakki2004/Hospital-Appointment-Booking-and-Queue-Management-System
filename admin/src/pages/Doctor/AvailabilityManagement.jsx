import React, { useContext, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  FiCalendar,
  FiClock,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiX,
  FiCheck,
  FiUsers,
} from "react-icons/fi";

const AvailabilityManagement = () => {
  const { dToken, backendUrl } = useContext(DoctorContext);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '13:00',
    slotPeriod: 'MORNING',
    capacity: '',
    isRecurring: false,
    recurringPattern: {
      daysOfWeek: [],
      repeatUntil: '',
      repeatCount: ''
    }
  });

  // Fetch availability function - defined before useEffect
  const fetchAvailability = useCallback(async () => {
    if (!dToken) {
      toast.error('Please login again');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Safely decode JWT token
      let doctorId;
      try {
        const tokenParts = dToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        doctorId = payload.id;
        
        if (!doctorId) {
          throw new Error('Doctor ID not found in token');
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        toast.error('Invalid token. Please login again');
        setIsLoading(false);
        return;
      }

      console.log('Fetching availability for doctor:', doctorId, 'date:', selectedDate);
      
      const { data } = await axios.get(
        `${backendUrl}/api/availability/list?doctorId=${doctorId}&date=${selectedDate}`,
        { headers: { dToken } }
      );

      console.log('Availability API response:', data);

      if (data.success) {
        setSlots(data.slots || []);
        if ((data.slots || []).length === 0) {
          console.log('No slots found for this date');
        }
      } else {
        toast.error(data.message || 'Failed to load availability');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load availability';
      console.error('Full error details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dToken, backendUrl, selectedDate]);

  // Load availability on mount and when dependencies change
  useEffect(() => {
    if (dToken) {
      fetchAvailability();
    } else {
      setIsLoading(false);
      toast.error('Please login to view availability');
    }
  }, [dToken, selectedDate, fetchAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dToken) {
      toast.error('Please login again');
      return;
    }
    
    try {
      // Safely decode JWT token
      let doctorId;
      try {
        const tokenParts = dToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        doctorId = payload.id;
        
        if (!doctorId) {
          throw new Error('Doctor ID not found in token');
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        toast.error('Invalid token. Please login again');
        return;
      }
      // Use the form date, not selectedDate filter
      const payload = {
        doctorId,
        date: formData.date, // Use form date
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotPeriod: formData.slotPeriod,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        isRecurring: formData.isRecurring || false,
        recurringPattern: formData.recurringPattern || {}
      };

      if (editingSlot) {
        const { data } = await axios.put(
          `${backendUrl}/api/availability/${editingSlot._id}`,
          payload,
          { headers: { dToken } }
        );

        if (data.success) {
          toast.success('Availability updated');
          setShowForm(false);
          setEditingSlot(null);
          resetForm();
          fetchAvailability();
        } else {
          toast.error(data.message || 'Failed to update availability');
        }
      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/availability/create`,
          payload,
          { headers: { dToken } }
        );

        if (data.success) {
          const createdSlots = data.slots || [];
          toast.success(`Created ${createdSlots.length} slot(s)`);
          
          // Update selectedDate to match the created slot's date so it shows immediately
          if (createdSlots.length > 0 && createdSlots[0].date) {
            setSelectedDate(createdSlots[0].date);
          }
          
          setShowForm(false);
          resetForm();
          
          // Force refresh - useEffect will trigger when selectedDate changes
          // Also call fetchAvailability directly as backup
          setTimeout(() => {
            fetchAvailability();
          }, 300);
        } else {
          toast.error(data.message || 'Failed to create availability');
        }
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save availability';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/availability/${slotId}`,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success('Slot deleted');
        fetchAvailability();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error(error.response?.data?.message || 'Failed to delete slot');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotPeriod: slot.slotPeriod,
      capacity: slot.capacity || '',
      isRecurring: slot.isRecurring || false,
      recurringPattern: slot.recurringPattern || {
        daysOfWeek: [],
        repeatUntil: '',
        repeatCount: ''
      }
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '13:00',
      slotPeriod: 'MORNING',
      capacity: '',
      isRecurring: false,
      recurringPattern: {
        daysOfWeek: [],
        repeatUntil: '',
        repeatCount: ''
      }
    });
    setEditingSlot(null);
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Availability Management
        </h1>
        <div className="flex gap-3">
          <button
            onClick={fetchAvailability}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <FiRefreshCw />
            Refresh
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            <FiPlus />
            Add Slot
          </motion.button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingSlot ? 'Edit Slot' : 'Create New Slot'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slot Period
                  </label>
                  <select
                    value={formData.slotPeriod}
                    onChange={(e) => setFormData({ ...formData, slotPeriod: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="EVENING">Evening</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    min="1"
                    placeholder="Leave empty for unlimited"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-700 dark:text-gray-300">
                  Recurring weekly pattern
                </label>
              </div>

              {formData.isRecurring && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Days of Week
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                        <label key={index} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.recurringPattern.daysOfWeek.includes(index)}
                            onChange={(e) => {
                              const days = [...formData.recurringPattern.daysOfWeek];
                              if (e.target.checked) {
                                days.push(index);
                              } else {
                                days.splice(days.indexOf(index), 1);
                              }
                              setFormData({
                                ...formData,
                                recurringPattern: { ...formData.recurringPattern, daysOfWeek: days }
                              });
                            }}
                            className="w-4 h-4 text-primary border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Repeat Until
                      </label>
                      <input
                        type="date"
                        value={formData.recurringPattern.repeatUntil}
                        onChange={(e) => setFormData({
                          ...formData,
                          recurringPattern: { ...formData.recurringPattern, repeatUntil: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Weeks
                      </label>
                      <input
                        type="number"
                        value={formData.recurringPattern.repeatCount}
                        onChange={(e) => setFormData({
                          ...formData,
                          recurringPattern: { ...formData.recurringPattern, repeatCount: e.target.value }
                        })}
                        min="1"
                        placeholder="e.g., 4"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium"
                >
                  {editingSlot ? 'Update' : 'Create'} Slot
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slots List */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading availability slots...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
          <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No availability slots found for {new Date(selectedDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Click "Add Slot" to create your first availability slot</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            <FiPlus className="inline mr-2" />
            Create First Slot
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <motion.div
              key={slot._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {slot.slotPeriod}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(slot.date).toLocaleDateString()}
                  </p>
                </div>
                {slot.isActive ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    Inactive
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiClock />
                  <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiUsers />
                  <span>{slot.totalTokens} / {slot.capacity || '∞'} tokens</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg: {slot.averageConsultationTime} min
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(slot)}
                  className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <FiEdit className="inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AvailabilityManagement;

