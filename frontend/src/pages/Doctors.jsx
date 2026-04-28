import React, { useContext, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiFilter,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiClock,
} from "react-icons/fi";

const Doctors = () => {
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;
  const navigate = useNavigate();
  const location = useLocation();
  const { doctors } = useContext(AppContext);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const specialities = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  const getRandomRating = () => {
    return (Math.random() * 2 + 3).toFixed(1);
  };

  const applyFilter = () => {
    let filtered = doctors.map((doc) => ({
      ...doc,
      rating: getRandomRating(),
    }));

    if (selectedSpecialities.length > 0) {
      filtered = filtered.filter((doc) =>
        selectedSpecialities.includes(doc.speciality)
      );
    }

    if (onlyAvailable) {
      filtered = filtered.filter((doc) => doc.available);
    }

    setFilterDoc(filtered);
    setCurrentPage(1); // Reset
  };

  // Handle speciality filter from navigation state (from MedicalAssistant)
  useEffect(() => {
    if (location.state?.filterSpeciality) {
      const speciality = location.state.filterSpeciality;
      if (!selectedSpecialities.includes(speciality)) {
        setSelectedSpecialities([speciality]);
      }
      // Clear the state to avoid re-applying on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    applyFilter();
  }, [selectedSpecialities, onlyAvailable, doctors]);

  // Get current doctors based on the page
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filterDoc.slice(indexOfFirstDoctor, indexOfLastDoctor);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full bg-gradient-to-br from-[#f8fafc] to-[#f0f4f8] dark:from-[#0f172a] dark:to-[#1e293b] py-6 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8 pb-20 md:pb-12"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
            Find Your Specialist
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
            Connect with top-rated doctors across various specialties
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <FiFilter className="text-primary" />
                Filters
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Specialties
                  </h4>
                  <div className="space-y-2">
                    {specialities.map((item, idx) => (
                      <motion.label
                        key={idx}
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            selectedSpecialities.includes(item)
                              ? "bg-primary border-primary"
                              : "border-gray-300 dark:border-gray-600 group-hover:border-primary"
                          }`}
                        >
                          {selectedSpecialities.includes(item) && (
                            <FiCheck className="text-white text-xs" />
                          )}
                        </div>
                        <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                          {item}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <motion.label
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        onlyAvailable
                          ? "bg-primary border-primary"
                          : "border-gray-300 dark:border-gray-600 group-hover:border-primary"
                      }`}
                    >
                      {onlyAvailable && (
                        <FiCheck className="text-white text-xs" />
                      )}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                      Available Now
                    </span>
                  </motion.label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              <FiFilter />
              Filters
            </motion.button>
          </div>

          {/* Mobile Filter Panel */}
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
                    Filters
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Specialties
                      </h4>
                      <div className="space-y-2">
                        {specialities.map((item, idx) => (
                          <label
                            key={idx}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 checked:bg-primary checked:border-primary"
                              checked={selectedSpecialities.includes(item)}
                              onChange={() =>
                                setSelectedSpecialities((prev) =>
                                  prev.includes(item)
                                    ? prev.filter((s) => s !== item)
                                    : [...prev, item]
                                )
                              }
                            />
                            <span className="text-gray-600 dark:text-gray-300">
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 checked:bg-primary checked:border-primary"
                          checked={onlyAvailable}
                          onChange={() => setOnlyAvailable((prev) => !prev)}
                        />
                        <span className="text-gray-600 dark:text-gray-300">
                          Available Now
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Doctors Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex-1"
          >
            {currentDoctors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor._id}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(`/appointment/${doctor._id}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  >
                    <div className="relative h-53 w-full overflow-hidden">
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
                        <FiClock className="text-xs" />
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

                      <div className="flex items-center gap-1 text-yellow-400">
                        {Array.from({ length: 5 }, (_, i) => (
                          <FiStar
                            key={i}
                            className={`${
                              i < Math.floor(doctor.rating)
                                ? "fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          ({doctor.rating})
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {doctor.experience} years experience
                        </span>
                        <span className="text-primary font-medium">
                          {doctor.fees}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center"
              >
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No doctors found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters to see more results
                </p>
              </motion.div>
            )}

            {/* Pagination */}
            {filterDoc.length > doctorsPerPage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-3 mt-12"
              >
                <motion.button
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border ${
                    currentPage === 1
                      ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "border-primary text-primary hover:bg-primary/10"
                  }`}
                >
                  <FiChevronLeft />
                  Previous
                </motion.button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.ceil(filterDoc.length / doctorsPerPage) },
                    (_, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => paginate(i + 1)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          currentPage === i + 1
                            ? "bg-primary text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {i + 1}
                      </motion.button>
                    )
                  )}
                </div>

                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage * doctorsPerPage >= filterDoc.length}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border ${
                    currentPage * doctorsPerPage >= filterDoc.length
                      ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "border-primary text-primary hover:bg-primary/10"
                  }`}
                >
                  Next
                  <FiChevronRight />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Doctors;
