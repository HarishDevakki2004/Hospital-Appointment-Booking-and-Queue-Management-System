import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AdminContext } from "../../context/AdminContext";
import {
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiSearch,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";

const DoctorList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors, deleteDoctor } =
    useContext(AdminContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpeciality, setFilterSpeciality] = useState("all");
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (aToken) {
      setIsLoading(true);
      getAllDoctors().finally(() => setIsLoading(false));
    }
  }, [aToken]);

  const handleToggleAvailability = async (id) => {
    setTogglingId(id);
    try {
      await changeAvailability(id);
    } finally {
      setTogglingId(null);
    }
  };

  const handleEditDoctor = (doctor) => {
    navigate('/edit-doctor', { state: { doctor } });
  };

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctorName}? This action cannot be undone.`)) {
      setDeletingId(doctorId);
      try {
        await deleteDoctor(doctorId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const specialities = [
    "all",
    ...new Set(doctors.map((doctor) => doctor.speciality)),
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpeciality =
      filterSpeciality === "all" || doctor.speciality === filterSpeciality;
    return matchesSearch && matchesSpeciality;
  });

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
    hover: {
      y: -5,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Our Medical Specialists
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {specialities.map((speciality) => (
              <option key={speciality} value={speciality}>
                {speciality === "all" ? "All Specialities" : speciality}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No doctors found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "Try a different search term"
              : "No doctors available"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor._id}
              variants={itemVariants}
              whileHover="hover"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <motion.img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                <div
                  className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    doctor.available
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {doctor.available ? (
                    <FiCheckCircle className="text-xs" />
                  ) : (
                    <FiXCircle className="text-xs" />
                  )}
                  {doctor.available ? "Available" : "Unavailable"}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  {doctor.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {doctor.speciality}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {doctor.experience} experience
                  </p>
                  <p className="text-primary font-medium">₹{doctor.fees}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doctor.available}
                      onChange={() => handleToggleAvailability(doctor._id)}
                      className="sr-only peer"
                      disabled={togglingId === doctor._id}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {togglingId === doctor._id ? (
                        <FiLoader className="animate-spin" />
                      ) : doctor.available ? (
                        "Available"
                      ) : (
                        "Unavailable"
                      )}
                    </span>
                  </label>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditDoctor(doctor)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiEdit2 className="text-sm" />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteDoctor(doctor._id, doctor.name)}
                      disabled={deletingId === doctor._id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === doctor._id ? (
                        <FiLoader className="animate-spin text-sm" />
                      ) : (
                        <>
                          <FiTrash2 className="text-sm" />
                          Delete
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DoctorList;
