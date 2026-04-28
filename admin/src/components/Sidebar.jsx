import React, { useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { assets } from '../assets/assets'
import { NavLink, useLocation } from 'react-router-dom'
import { FiHome, FiCalendar, FiUserPlus, FiUsers, FiUser, FiMenu, FiChevronRight, FiList } from 'react-icons/fi'

const Sidebar = () => {
    const { dToken } = useContext(DoctorContext)
    const { aToken } = useContext(AdminContext)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [hoveredItem, setHoveredItem] = useState(null)
    const location = useLocation()

    const adminLinks = [
        { path: '/admin-dashboard', icon: <FiHome />, label: 'Dashboard' },
        { path: '/all-appointments', icon: <FiCalendar />, label: 'Appointments' },
        { path: '/add-doctor', icon: <FiUserPlus />, label: 'Add Doctor' },
        { path: '/doctor-list', icon: <FiUsers />, label: 'Doctors List' }
    ]

    const doctorLinks = [
        { path: '/doctor-dashboard', icon: <FiHome />, label: 'Dashboard' },
        { path: '/doctor-appointments', icon: <FiCalendar />, label: 'Appointments' },
        { path: '/availability-management', icon: <FiCalendar />, label: 'Availability' },
        { path: '/queue-management', icon: <FiList />, label: 'Queue Management' },
        { path: '/doctor-profile', icon: <FiUser />, label: 'Profile' }
    ]

    const activeLinks = aToken ? adminLinks : dToken ? doctorLinks : []

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: (i) => ({
            x: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }),
        hover: {
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            transition: { duration: 0.2 }
        }
    }

    const iconVariants = {
        hidden: { scale: 0 },
        visible: {
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 10
            }
        }
    }

    return (
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: isCollapsed ? "80px" : "280px" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed md:relative h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm z-40 overflow-hidden`}
        >
            {/* Collapse Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
                <FiMenu className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Logo */}
            <motion.div 
                className="flex items-center justify-center py-6 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <img 
                    src={assets.admin_logo} 
                    alt="MediQ Logo" 
                    className={`h-8 transition-all ${isCollapsed ? 'w-8' : 'w-32'}`}
                />
            </motion.div>

            {/* Navigation Links */}
            <nav className="mt-6">
                <ul className="space-y-2 px-3">
                    {activeLinks.map((link, index) => (
                        <motion.li
                            key={link.path}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            variants={itemVariants}
                            onMouseEnter={() => setHoveredItem(link.path)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => 
                                    `flex items-center gap-3 p-3 rounded-lg transition-colors relative overflow-hidden
                                    ${isActive ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-gray-600 dark:text-gray-300 hover:text-primary'}`
                                }
                            >
                                <motion.span 
                                    variants={iconVariants}
                                    className="text-lg flex-shrink-0"
                                >
                                    {link.icon}
                                </motion.span>
                                
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="whitespace-nowrap"
                                        >
                                            {link.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {location.pathname === link.path && (
                                    <motion.div 
                                        className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"
                                        layoutId="activeIndicator"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <AnimatePresence>
                                    {hoveredItem === link.path && !isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="ml-auto text-primary"
                                        >
                                            <FiChevronRight />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        </motion.li>
                    ))}
                </ul>
            </nav>

            {/* Collapsed Tooltips */}
            <AnimatePresence>
                {isCollapsed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-full top-0 ml-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 z-50"
                    >
                        {activeLinks.map(link => (
                            <motion.div
                                key={link.path}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                            >
                                {link.label}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Sidebar