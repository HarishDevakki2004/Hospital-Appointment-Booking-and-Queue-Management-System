import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, User, Calendar, Stethoscope } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/my-appointments', label: 'Appointments', icon: Calendar },
    { path: '/my-profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive || active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              {({ isActive: navIsActive }) => {
                const isItemActive = navIsActive || active;
                return (
                  <motion.div
                    className="flex flex-col items-center justify-center relative"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon 
                      size={22} 
                      className={isItemActive ? 'text-blue-600 dark:text-blue-400' : ''}
                    />
                    <span className={`text-xs mt-1 ${isItemActive ? 'font-semibold text-blue-600 dark:text-blue-400' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </motion.div>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

