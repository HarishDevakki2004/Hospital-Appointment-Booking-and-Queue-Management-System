import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { assets } from '../assets/assets'

const About = () => {
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
    hidden: { y: 50, opacity: 0 },
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

  const featureCards = [
    {
      title: "EFFICIENCY",
      description: "Streamlined appointment scheduling that fits into your busy lifestyle.",
      icon: "⏱️"
    },
    {
      title: "CONVENIENCE",
      description: "Access to a network of trusted healthcare professionals in your area.",
      icon: "🏥"
    },
    {
      title: "PERSONALIZATION",
      description: "Tailored recommendations and reminders to help you stay on top of your health.",
      icon: "✨"
    }
  ]

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full bg-gradient-to-br from-[#001f2b] to-[#003d4d] text-white overflow-hidden pb-20 md:pb-0"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <motion.div 
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500 mix-blend-screen filter blur-[100px]"
        />
        <motion.div 
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-400 mix-blend-screen filter blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            ABOUT <span className="text-cyan-300">US</span>
          </h1>
          <div className="w-24 h-1 bg-cyan-400 mx-auto mt-4" />
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col lg:flex-row gap-16 items-center mb-28"
        >
          {/* Image */}
          <motion.div 
            variants={itemVariants}
            className="w-full lg:w-1/2"
          >
            <motion.img
              src={assets.about_image}
              alt="About MediQ"
              className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto border-4 border-white/10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
          </motion.div>

          {/* Text Content */}
          <motion.div 
            variants={itemVariants}
            className="w-full lg:w-1/2 space-y-8"
          >
            <motion.p 
              className="text-lg leading-relaxed"
              whileInView={{ opacity: 1 }}
            >
              Welcome to <span className="text-cyan-300 font-medium">MediQ</span>, your trusted partner in managing your healthcare needs conveniently and efficiently. At MediQ, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
            </motion.p>
            
            <motion.p 
              className="text-lg leading-relaxed"
              whileInView={{ opacity: 1 }}
            >
              MediQ is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, MediQ is here to support you every step of the way.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm"
            >
              <h3 className="text-cyan-300 text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-lg">
                Our vision at MediQ is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            WHY <span className="text-cyan-300">CHOOSE US</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ y: -10 }}
                className="bg-white/5 p-8 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="text-4xl mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-cyan-300">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default About