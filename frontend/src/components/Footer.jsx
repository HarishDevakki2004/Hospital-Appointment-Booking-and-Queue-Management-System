import React, { useRef } from "react";
import { assets } from "../assets/assets";
import { motion, useInView } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { contactInfo } from "../config/contactInfo";

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const socialLinks = [
    { icon: <FaFacebook className="text-xl" />, name: "Facebook" },
    { icon: <FaTwitter className="text-xl" />, name: "Twitter" },
    { icon: <FaInstagram className="text-xl" />, name: "Instagram" },
    { icon: <FaLinkedin className="text-xl" />, name: "LinkedIn" }
  ];

  const companyLinks = [
    { name: "Home", path: "/" },
    { name: "About us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Privacy policy", path: "/privacy" }
  ];

  const footerContactInfo = [
    { type: "phone", value: contactInfo.phone },
    { type: "email", value: contactInfo.email },
    { type: "address", value: `${contactInfo.address.line1}, ${contactInfo.address.line2}` }
  ];

  return (
    <footer 
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#121212] text-gray-800 dark:text-gray-200"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
      </div>

      <div className="relative z-10 px-4 py-8 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12"
        >
          {/* Logo and description */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-40"
            >
              <img src={assets.logo} alt="MediQ Logo" className="w-full bg-slate-100" />
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {contactInfo.company.description}
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  aria-label={social.name}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.h3 
              className="text-xl font-semibold text-gray-900 dark:text-white"
              whileHover={{ x: 5 }}
            >
              Company
            </motion.h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-300"
                >
                  <a href={link.path}>{link.name}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.h3 
              className="text-xl font-semibold text-gray-900 dark:text-white"
              whileHover={{ x: 5 }}
            >
              Contact
            </motion.h3>
            <ul className="space-y-3">
              {footerContactInfo.map((info, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-3 text-gray-600 dark:text-gray-300"
                >
                  <span className="mt-1 w-4 h-4 rounded-full bg-primary opacity-80"></span>
                  <span>{info.value}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.h3 
              className="text-xl font-semibold text-gray-900 dark:text-white"
              whileHover={{ x: 5 }}
            >
              Newsletter
            </motion.h3>
            <p className="text-gray-600 dark:text-gray-300">
              Subscribe to get health tips and special offers
            </p>
            <motion.form 
              className="flex flex-col space-y-4"
              whileInView={{ opacity: 1 }}
            >
              <motion.input
                type="email"
                placeholder="Your email"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.hr 
          className="border-gray-200 dark:border-gray-800 my-12"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-center text-center text-gray-500 dark:text-gray-400 text-sm"
        >
          <p>© {new Date().getFullYear()} MediQ. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition">Terms of Service</a>
            <a href="#" className="hover:text-primary transition">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition">Cookies</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;