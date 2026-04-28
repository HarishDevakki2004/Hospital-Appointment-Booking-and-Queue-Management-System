import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  FiEdit2,
  FiSave,
  FiX,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiInfo,
} from "react-icons/fi";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData } =
    useContext(DoctorContext);
  const { currency, backendUrl } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const controls = useAnimation();

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        about: profileData.about,
        available: profileData.available,
        phone: profileData.phone,
      };

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        {
          headers: { dToken },
        }
      );

      if (data.success) {
        await controls.start("success");
        toast.success(data.message);
        setTimeout(() => {
          setIsEdit(false);
          getProfileData();
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const toggleEdit = () => {
    setIsEdit(!isEdit);
    controls.start(isEdit ? "exit" : "enter");
  };

  if (!profileData)
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 py-12"
    >
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Profile Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="w-full lg:w-1/3 flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative group w-full max-w-xs"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl shadow-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
            <img
              className="relative w-full h-auto rounded-3xl object-cover aspect-square z-10 border-4 border-white shadow-lg"
              src={profileData.image}
              alt={profileData.name}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: profileData.available ? 1 : 0.5 }}
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20"
            >
              <div
                className={`px-4 py-1 rounded-full shadow-md flex items-center gap-2 ${
                  profileData.available
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <motion.span
                  animate={{
                    scale: profileData.available ? [1, 1.2, 1] : 1,
                    transition: {
                      repeat: profileData.available ? Infinity : 0,
                      duration: 2,
                    },
                  }}
                  className="w-2 h-2 rounded-full bg-current"
                ></motion.span>
                <span className="text-sm font-medium">
                  {profileData.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-800">
              {profileData.name}
            </h1>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {profileData.speciality}
              </span>
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                {profileData.degree}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {profileData.experience} years exp
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Details Section */}
        <motion.div
          className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Profile Information
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleEdit}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isEdit
                    ? "bg-gray-100 text-gray-800"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {isEdit ? (
                  <>
                    <FiX size={16} />
                    Cancel
                  </>
                ) : (
                  <>
                    <FiEdit2 size={16} />
                    Edit Profile
                  </>
                )}
              </motion.button>
            </div>

            {/* About Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FiInfo className="text-primary" size={20} />
                <h3 className="text-lg font-medium text-gray-700">About</h3>
              </div>
              <AnimatePresence mode="wait">
                {isEdit ? (
                  <motion.textarea
                    key="edit-about"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        about: e.target.value,
                      }))
                    }
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={5}
                    value={profileData.about}
                  />
                ) : (
                  <motion.p
                    key="view-about"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-600 leading-relaxed"
                  >
                    {profileData.about}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Fees */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: 18 }}>₹</span>
                  <h3 className="font-medium text-gray-700">
                    Consultation Fee
                  </h3>
                </div>
                {isEdit ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {currency}
                      </span>
                      <input
                        type="number"
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            fees: e.target.value,
                          }))
                        }
                        value={profileData.fees}
                        className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-800">
                    {currency} {profileData.fees}
                  </p>
                )}
              </div>

              {/* Availability */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FiClock className="text-primary" size={18} />
                  <h3 className="font-medium text-gray-700">Availability</h3>
                </div>
                <motion.div
                  whileHover={{ scale: isEdit ? 1.02 : 1 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer ${
                    profileData.available
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                  onClick={() =>
                    isEdit &&
                    setProfileData((prev) => ({
                      ...prev,
                      available: !prev.available,
                    }))
                  }
                >
                  <input
                    type="checkbox"
                    checked={profileData.available}
                    onChange={() => {}}
                    className="hidden"
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${
                      profileData.available ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium">
                    {profileData.available
                      ? "Accepting patients"
                      : "Not available"}
                  </span>
                </motion.div>
              </div>

              {/* Phone */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: 18 }}>📞</span>
                  <h3 className="font-medium text-gray-700">Phone Number</h3>
                </div>
                {isEdit ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <input
                      type="tel"
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      value={profileData.phone || ''}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </motion.div>
                ) : (
                  <p className="text-lg font-semibold text-gray-800">
                    {profileData.phone || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="bg-gray-50 p-5 rounded-xl md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <FiMapPin className="text-primary" size={18} />
                  <h3 className="font-medium text-gray-700">Address</h3>
                </div>
                {isEdit ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line1: e.target.value },
                        }))
                      }
                      value={profileData.address.line1}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Address line 1"
                    />
                    <input
                      type="text"
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line2: e.target.value },
                        }))
                      }
                      value={profileData.address.line2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Address line 2"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-600 space-y-1"
                  >
                    <p>{profileData.address.line1}</p>
                    <p>{profileData.address.line2}</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <AnimatePresence>
              {isEdit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-8 flex justify-end"
                >
                  <motion.button
                    variants={{
                      initial: { scale: 1 },
                      loading: { scale: 0.95 },
                      success: {
                        scale: [1, 1.1, 1],
                        backgroundColor: ["#3B82F6", "#10B981"],
                      },
                    }}
                    initial="initial"
                    animate={controls}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={updateProfile}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white ${
                      isLoading ? "bg-primary/80" : "bg-primary"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        <FiSave size={16} />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DoctorProfile;
