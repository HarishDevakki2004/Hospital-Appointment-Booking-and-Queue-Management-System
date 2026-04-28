import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion, useAnimation } from "framer-motion";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const controls = useAnimation();
  const [isMounted, setIsMounted] = React.useState(false);

  // Infinite scroll animation
  const animateScroll = React.useCallback(async () => {
    if (!isMounted) return;
    
    try {
      await controls.start({
        x: "-100%",
        transition: { duration: 30, ease: "linear" }
      });
      // Reset and loop
      await controls.start({ x: "0%", transition: { duration: 0 } });
      if (isMounted) {
        animateScroll();
      }
    } catch (error) {
      // Component might have unmounted, ignore error
      console.debug('Animation stopped:', error);
    }
  }, [controls, isMounted]);

  React.useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
    
    // Start animation after component is fully mounted
    const timer = setTimeout(() => {
      if (isMounted && doctors.length > 0) {
        animateScroll();
      }
    }, 200);
    
    return () => {
      setIsMounted(false);
      clearTimeout(timer);
      controls.stop();
    };
  }, [controls, doctors.length, isMounted, animateScroll]);

  return (
    <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Decorative elements */}
      <motion.div 
        className="absolute inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Top Specialists</span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-500 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Connect with our trusted healthcare professionals for personalized care
          </motion.p>
        </motion.div>

        {/* Doctors Carousel */}
        <div className="relative overflow-hidden py-6">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>

          <motion.div
            className="flex gap-6"
            animate={controls}
          >
            {[...doctors.slice(0, 10), ...doctors.slice(0, 10)].map((doctor, index) => (
              <motion.div
                key={`${doctor._id}-${index}`}
                className="min-w-[280px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
                onClick={() => {
                  navigate(`/appointment/${doctor._id}`);
                  window.scrollTo(0, 0);
                }}
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {doctor.available ? "Available" : "Booked"}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                  <p className="text-gray-500 mb-3">{doctor.speciality}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {doctor.location 
                        ? (typeof doctor.location === 'string' 
                            ? doctor.location 
                            : doctor.location.address || "Location available")
                        : "Online Consultation"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.button
            onClick={() => {
              navigate("/doctors");
              window.scrollTo(0, 0);
            }}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Doctors
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TopDoctors;