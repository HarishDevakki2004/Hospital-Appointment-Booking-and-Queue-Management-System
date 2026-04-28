import React, { useContext, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiEdit,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token, backendUrl, userData, setUserData, loadUserProfileData, handleLogout } =
    useContext(AppContext);
  const fileInputRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Update user profile data
  const updateUserProfileData = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    if (isEdit) {
      fileInputRef.current.click();
    }
  };

  const genderOptions = ["Not Selected", "Male", "Female", "Other"];

  if (!userData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 pb-20 md:pb-12"
    >
      <div className="max-w-md mx-auto">
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              {/* Profile Image */}
              <motion.div
                whileHover={isEdit ? { scale: 1.05 } : {}}
                whileTap={isEdit ? { scale: 0.95 } : {}}
                onClick={handleImageClick}
                className={`inline-block relative rounded-full border-4 border-white dark:border-gray-800 shadow-lg mx-auto ${
                  isEdit ? "cursor-pointer" : ""
                }`}
              >
                <img
                  className="w-32 h-32 rounded-full object-cover"
                  src={image ? URL.createObjectURL(image) : userData.image}
                  alt="Profile"
                />
                {isEdit && (
                  <>
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <FiEdit className="text-white text-2xl" />
                    </div>
                    <input
                      ref={fileInputRef}
                      onChange={(e) => setImage(e.target.files[0])}
                      type="file"
                      className="hidden"
                      accept="image/*"
                    />
                  </>
                )}
              </motion.div>

              {/* Name */}
              {isEdit ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full bg-white/90 dark:bg-gray-800/90 rounded-lg px-4 py-2 text-center text-xl font-semibold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </motion.div>
              ) : (
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-xl font-semibold text-white"
                >
                  {userData.name}
                </motion.h2>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                <FiUser className="text-primary" />
                Contact Information
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <FiMail className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-gray-700 dark:text-gray-200">
                      {userData.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <FiPhone className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    {isEdit ? (
                      <input
                        type="text"
                        value={userData.phone}
                        onChange={(e) =>
                          setUserData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary text-gray-700 dark:text-gray-200"
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-200">
                        {userData.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Address
                    </p>
                    {isEdit ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={userData.address.line1}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                line1: e.target.value,
                              },
                            }))
                          }
                          className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary text-gray-700 dark:text-gray-200"
                          placeholder="Address line 1"
                        />
                        <input
                          type="text"
                          value={userData.address.line2}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                line2: e.target.value,
                              },
                            }))
                          }
                          className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary text-gray-700 dark:text-gray-200"
                          placeholder="Address line 2"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-200">
                        {userData.address.line1}
                        <br />
                        {userData.address.line2}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                <FiUser className="text-primary" />
                Basic Information
              </h3>

              <div className="space-y-4">
                {/* Gender */}
                <div className="flex items-start gap-3">
                  <FiUser className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Gender
                    </p>
                    {isEdit ? (
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="w-full flex items-center justify-between bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none text-gray-700 dark:text-gray-200 py-1"
                        >
                          {userData.gender}
                          <FiChevronDown
                            className={`transition-transform ${
                              dropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {dropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600"
                            >
                              {genderOptions.map((option) => (
                                <div
                                  key={option}
                                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                  onClick={() => {
                                    setUserData((prev) => ({
                                      ...prev,
                                      gender: option,
                                    }));
                                    setDropdownOpen(false);
                                  }}
                                >
                                  {option}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-200">
                        {userData.gender}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-start gap-3">
                  <FiCalendar className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Date of Birth
                    </p>
                    {isEdit ? (
                      <input
                        type="date"
                        value={userData.dob}
                        onChange={(e) =>
                          setUserData((prev) => ({
                            ...prev,
                            dob: e.target.value,
                          }))
                        }
                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary text-gray-700 dark:text-gray-200"
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-200">
                        {userData.dob}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <div className="flex justify-center gap-4">
                {isEdit ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setIsEdit(false);
                        setImage(false);
                      }}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={updateUserProfileData}
                      disabled={isLoading}
                      className="px-6 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave />
                          Save
                        </>
                      )}
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsEdit(true)}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <FiEdit />
                    Edit Profile
                  </motion.button>
                )}
              </div>
              
              {/* Logout Button */}
              {!isEdit && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    handleLogout();
                    navigate('/login');
                  }}
                  className="w-full px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FiLogOut />
                  Logout
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MyProfile;
