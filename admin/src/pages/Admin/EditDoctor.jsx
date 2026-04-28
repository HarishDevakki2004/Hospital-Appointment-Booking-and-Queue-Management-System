import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AppContext } from "../../context/AppContext";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiDollarSign,
  FiBook,
  FiMapPin,
  FiEdit2,
  FiSave,
  FiArrowLeft,
} from "react-icons/fi";

const EditDoctor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctor = location.state?.doctor;

  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("MBBS");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { backendUrl } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);

  useEffect(() => {
    if (!doctor) {
      toast.error("No doctor data found");
      navigate("/doctor-list");
      return;
    }

    // Populate form with existing doctor data
    setName(doctor.name || "");
    setEmail(doctor.email || "");
    setExperience(doctor.experience || "1 Year");
    setFees(doctor.fees?.toString() || "");
    setAbout(doctor.about || "");
    setSpeciality(doctor.speciality || "General physician");
    setDegree(doctor.degree || "MBBS");
    
    if (doctor.address) {
      if (typeof doctor.address === 'object') {
        setAddress1(doctor.address.line1 || "");
        setAddress2(doctor.address.line2 || "");
      } else {
        setAddress1(doctor.address);
      }
    }

    if (doctor.location) {
      setLatitude(doctor.location.latitude?.toString() || "");
      setLongitude(doctor.location.longitude?.toString() || "");
    }
  }, [doctor, navigate]);

  const experienceOptions = [
    "1 Year",
    "2 Years",
    "3 Years",
    "4 Years",
    "5 Years",
    "6 Years",
    "8 Years",
    "9 Years",
    "10 Years",
  ];
  const specialityOptions = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Only append image if a new one is selected
      if (docImg) {
        formData.append("image", docImg);
      }
      
      formData.append("docId", doctor._id);
      formData.append("name", name);
      formData.append("email", email);
      if (password) {
        formData.append("password", password);
      }
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      const { data } = await axios.post(
        backendUrl + "/api/admin/update-doctor",
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/doctor-list");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Update doctor error:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || error.response?.statusText || error.message || "Failed to update doctor";
      toast.error(`Update failed: ${errorMessage} (Status: ${error.response?.status || 'Unknown'})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  if (!doctor) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 w-full max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/doctor-list")}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <FiArrowLeft className="text-gray-700 dark:text-gray-300" />
        </motion.button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Edit Doctor Profile
        </h1>
      </motion.div>

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={onSubmitHandler}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8"
      >
        {/* Image Upload */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImageClick}
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary cursor-pointer bg-gray-100 dark:bg-gray-700"
          >
            {docImg ? (
              <img
                src={URL.createObjectURL(docImg)}
                alt="Doctor"
                className="w-full h-full object-cover"
              />
            ) : doctor.image ? (
              <img
                src={doctor.image}
                alt="Doctor"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiUser className="text-4xl text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
              <FiEdit2 className="text-white opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setDocImg(e.target.files[0])}
            className="hidden"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click to change image (optional)
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Name */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiUser className="text-primary" />
                Doctor Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter doctor's name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiMail className="text-primary" />
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter email address"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiLock className="text-primary" />
                Password (Leave blank to keep current)
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter new password (optional)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </motion.div>

            {/* Experience */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiBriefcase className="text-primary" />
                Experience
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Fees */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiDollarSign className="text-primary" />
                Consultation Fees
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  type="number"
                  placeholder="Enter consultation fees"
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Speciality */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiUser className="text-primary" />
                Speciality
              </label>
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                {specialityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Degree */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiBook className="text-primary" />
                Degree
              </label>
              <input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                type="text"
                placeholder="Enter doctor's degree"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </motion.div>

            {/* Address */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FiMapPin className="text-primary" />
                Address
              </label>
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                type="text"
                placeholder="Address line 1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mb-2"
                required
              />
              <input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                type="text"
                placeholder="Address line 2"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mb-2"
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g., 28.6139)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
                <input
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g., 77.2090)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Get coordinates from{" "}
                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Maps
                </a>
                {" "}(right-click on location → Coordinates)
              </p>
            </motion.div>
          </div>
        </div>

        {/* About Doctor */}
        <motion.div variants={itemVariants} className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <FiEdit2 className="text-primary" />
            About Doctor
          </label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            placeholder="Write about the doctor's qualifications, expertise, etc."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-full font-medium text-white bg-primary hover:bg-primary-dark transition-all flex items-center gap-2 ${
              isSubmitting ? "opacity-80" : ""
            }`}
          >
            {isSubmitting ? (
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
                Updating Doctor...
              </>
            ) : (
              <>
                <FiSave />
                Update Doctor
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default EditDoctor;

