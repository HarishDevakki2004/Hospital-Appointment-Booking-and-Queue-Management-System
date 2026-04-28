import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { assets } from '../assets/assets'
import { FiMapPin, FiPhone, FiMail, FiArrowRight } from 'react-icons/fi'
import { contactInfo } from '../config/contactInfo'

const Contact = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  }

  return (
    <motion.section 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#121212] pb-20 md:pb-0"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500 mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-400 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            CONTACT <span className="text-primary">US</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mt-4" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto"
          >
            We'd love to hear from you. Reach out to our team for any inquiries or support.
          </motion.p>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Image */}
          <motion.div 
            variants={itemVariants}
            className="w-full"
          >
            <motion.img
              src={assets.contact_image}
              alt="Contact us"
              className="rounded-2xl shadow-xl w-full max-w-lg mx-auto border-4 border-white/10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            variants={itemVariants}
            className="space-y-8"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <FiMapPin className="text-primary" />
                OUR OFFICE
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {contactInfo.address.line1}<br />
                {contactInfo.address.line2}<br />
                {contactInfo.address.country}
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <FiPhone className="text-primary" />
                CONTACT INFO
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary opacity-80"></span>
                  Tel: {contactInfo.phone}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary opacity-80"></span>
                  Email: {contactInfo.email}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <FiMail className="text-primary" />
                CAREERS AT DOC+
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Learn more about our teams and job openings.
              </p>
              <motion.button
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-all"
              >
                Explore Jobs <FiArrowRight className="text-lg" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Contact Form (optional - can be added here) */}
      </div>
    </motion.section>
  )
}

export default Contact