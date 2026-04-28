import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { assets } from '../assets/assets.js';

const Header = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const [currentSpecialty, setCurrentSpecialty] = useState(0);
  const specialties = ['Cardiologists', 'Dermatologists', 'Pediatricians', 'Neurologists'];
  const stats = [
    { value: '500+', label: 'Patients Daily' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Availability' }
  ];

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpecialty((prev) => (prev + 1) % specialties.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: [0.1, 0.25, 0.3, 1],
        duration: 0.6
      }
    }
  };

  const specialty = {
    enter: { y: 20, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };

  return (
    <motion.header
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={container}
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/5 to-transparent"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-400 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 py-12 md:py-20 lg:py-28">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-7xl mx-auto">
          {/* Content */}
          <motion.div variants={container} className="space-y-6 md:space-y-8">
            <motion.h1 
              variants={item}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Find & Connect With{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Trusted</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-500/30 z-0"></span>
              </span>{' '}
              Healthcare Specialists
            </motion.h1>

            <motion.div variants={item} className="relative h-12">
              <p className="text-xl text-gray-300 inline-flex items-baseline">
                Book appointments with{' '}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSpecialty}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={specialty}
                    transition={{ duration: 0.5 }}
                    className="inline-block font-semibold text-blue-400 min-w-[160px] mx-1"
                  >
                    {specialties[currentSpecialty]}
                  </motion.span>
                </AnimatePresence>
              </p>
            </motion.div>

            <motion.p variants={item} className="text-base sm:text-lg text-gray-300 max-w-lg">
              Our platform connects you with top-rated medical professionals for seamless appointment booking and quality care.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <motion.a
                href="/doctors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-medium transition-colors"
              >
                Find Your Doctor
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </motion.a>

              <motion.a
                href="/doctors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-transparent border border-gray-600 hover:border-gray-500 text-white px-6 py-3.5 rounded-full font-medium transition-colors"
              >
                Browse Specialties
                <ChevronRight size={18} />
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={item}
              className="flex flex-wrap gap-6 mt-10"
            >
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={assets.header_img}
                alt="Doctor consulting with patient"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
            </div>

          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;