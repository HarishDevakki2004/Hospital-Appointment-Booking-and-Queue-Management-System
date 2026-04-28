import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiSettings,
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-toastify";

const QueueManagement = () => {
  const { dToken, backendUrl } = useContext(DoctorContext);
  const { slotDateFormat } = useContext(AppContext);
  
  // Helper function to convert ISO date (YYYY-MM-DD) to slotDate format (day_month_year)
  const convertToSlotDate = (isoDate) => {
    // Parse ISO date string to avoid timezone issues
    const [year, month, day] = isoDate.split('-').map(Number);
    return `${day}_${month}_${year}`;
  };

  const [queueData, setQueueData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [averageTime, setAverageTime] = useState(10);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
    address: "",
  });

  useEffect(() => {
    if (dToken) {
      fetchQueueStatus();
      fetchDoctorSettings();
    }
  }, [dToken, selectedDate]);

  const fetchQueueStatus = async () => {
    try {
      setIsLoading(true);
      const slotDate = convertToSlotDate(selectedDate);
      const response = await fetch(backendUrl + "/api/queue/get-queue-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dToken: dToken,
        },
        body: JSON.stringify({
          docId: JSON.parse(atob(dToken.split(".")[1])).id,
          date: slotDate,
        }),
      });
      
      const data = await response.json();

      if (data && data.success) {
        setQueueData(data.queueData);
      } else {
        toast.error(data?.message || "Failed to fetch queue status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch queue status");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorSettings = async () => {
    try {
      const response = await fetch(backendUrl + "/api/doctor/profile", {
        headers: { dToken: dToken },
      });
      
      const data = await response.json();

      if (data && data.success) {
        setAverageTime(data.profileData?.averageDiagnosisTime || 10);
        if (data.profileData?.location) {
          setLocation({
            latitude: data.profileData.location.latitude || "",
            longitude: data.profileData.location.longitude || "",
            address: data.profileData.location.address || "",
          });
        }
      } else {
        toast.error(data?.message || "Failed to fetch doctor settings");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch doctor settings");
    }
  };

  const handleMarkCompleted = async () => {
    try {
      setIsUpdating(true);
      const slotDate = convertToSlotDate(selectedDate);
      const response = await fetch(backendUrl + "/api/queue/update-queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dToken: dToken,
        },
        body: JSON.stringify({
          docId: JSON.parse(atob(dToken.split(".")[1])).id,
          date: slotDate,
        }),
      });
      
      const data = await response.json();

      if (data && data.success) {
        toast.success(data.message);
        fetchQueueStatus();
      } else {
        toast.error(data?.message || "Failed to update queue");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update queue");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAverageTime = async () => {
    try {
      const response = await fetch(backendUrl + "/api/queue/update-avg-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dToken: dToken,
        },
        body: JSON.stringify({
          docId: JSON.parse(atob(dToken.split(".")[1])).id,
          averageDiagnosisTime: parseInt(averageTime),
        }),
      });
      
      const data = await response.json();

      if (data && data.success) {
        toast.success(data.message);
      } else {
        toast.error(data?.message || "Failed to update average time");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update average time");
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const response = await fetch(backendUrl + "/api/queue/update-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dToken: dToken,
        },
        body: JSON.stringify({
          docId: JSON.parse(atob(dToken.split(".")[1])).id,
          ...location,
        }),
      });
      
      const data = await response.json();

      if (data && data.success) {
        toast.success(data.message);
      } else {
        toast.error(data?.message || "Failed to update location");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update location");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white"
        >
          Queue Management
        </motion.h1>
        <button
          onClick={fetchQueueStatus}
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

      {/* Queue Stats */}
      {queueData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {queueData.totalTokens}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Total Tokens
                </p>
              </div>
              <FiUsers className="text-4xl text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {queueData.currentToken || 0}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Current Token
                </p>
              </div>
              <FiCheckCircle className="text-4xl text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {queueData.remainingTokens}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Remaining Tokens
                </p>
              </div>
              <FiClock className="text-4xl text-orange-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Current Patient */}
      {queueData?.currentPatient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Currently Treating
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {queueData.currentPatient.name}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Token #{queueData.currentPatient.tokenNumber}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkCompleted}
              disabled={isUpdating}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Mark as Completed"}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Upcoming Tokens */}
      {queueData?.upcomingTokens && queueData.upcomingTokens.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Upcoming Tokens
          </h3>
          <div className="space-y-3">
            {queueData.upcomingTokens.map((token, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    Token #{token.tokenNumber} - {token.patientName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Estimated wait: {token.estimatedTime} minutes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <FiSettings className="text-primary" />
          Settings
        </h3>

        {/* Average Diagnosis Time */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Average Diagnosis Time (minutes)
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={averageTime}
              onChange={(e) => setAverageTime(e.target.value)}
              min="1"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleUpdateAverageTime}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
            >
              Update
            </button>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FiMapPin className="text-primary" />
            Clinic Location
          </label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Address"
              value={location.address}
              onChange={(e) =>
                setLocation({ ...location, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Latitude"
                value={location.latitude}
                onChange={(e) =>
                  setLocation({ ...location, latitude: e.target.value })
                }
                step="any"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={location.longitude}
                onChange={(e) =>
                  setLocation({ ...location, longitude: e.target.value })
                }
                step="any"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleUpdateLocation}
              className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
            >
              Update Location
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QueueManagement;



