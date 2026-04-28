import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiClock, FiUser } from 'react-icons/fi';

/**
 * TokenChip Component
 * Displays a token with visual states and animations
 * 
 * Props:
 * - index: Token number (1-based)
 * - status: 'COMPLETED' | 'IN_PROGRESS' | 'BOOKED' | 'AVAILABLE' | 'CANCELLED'
 * - isCurrent: Boolean - is this the current token being served
 * - isUserToken: Boolean - is this the user's own token
 * - estimatedStart: Number - timestamp when service should start
 * - onClick: Function - called when chip is clicked (for booking)
 */
const TokenChip = ({ 
    index, 
    status, 
    isCurrent = false, 
    isUserToken = false,
    estimatedStart = null,
    onClick = null
}) => {
    // Format estimated start time
    const formatEstimatedTime = (timestamp) => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get chip styling based on status
    const getChipStyles = () => {
        const baseStyles = "relative flex flex-col items-center justify-center p-3 rounded-lg transition-all cursor-pointer";
        
        if (isUserToken) {
            return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-2 border-green-500 shadow-lg ring-2 ring-green-300 dark:ring-green-700`;
        }

        switch (status) {
            case 'COMPLETED':
                return `${baseStyles} bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400`;
            case 'IN_PROGRESS':
                return `${baseStyles} bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300`;
            case 'BOOKED':
                return `${baseStyles} bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 text-blue-700 dark:text-blue-300`;
            case 'AVAILABLE':
                return `${baseStyles} bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary`;
            case 'CANCELLED':
                return `${baseStyles} bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400 line-through`;
            default:
                return `${baseStyles} bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600`;
        }
    };

    // Animation variants
    const chipVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: { 
            scale: 1, 
            opacity: 1,
            transition: { duration: 0.3 }
        },
        pulse: {
            scale: [1, 1.1, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        slide: {
            x: [0, -10, 0],
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div
            variants={chipVariants}
            initial="initial"
            animate={isCurrent ? ["animate", "pulse"] : "animate"}
            whileHover={onClick && status === 'AVAILABLE' ? { scale: 1.05 } : {}}
            whileTap={onClick && status === 'AVAILABLE' ? { scale: 0.95 } : {}}
            className={getChipStyles()}
            onClick={onClick && status === 'AVAILABLE' ? onClick : undefined}
        >
            {/* Token Number */}
            <div className="flex items-center gap-1 mb-1">
                {status === 'COMPLETED' && <FiCheck className="text-sm" />}
                {status === 'IN_PROGRESS' && <FiUser className="text-sm animate-pulse" />}
                <span className="font-bold text-lg">{index}</span>
            </div>

            {/* Estimated Time */}
            {estimatedStart && (
                <div className="text-xs flex items-center gap-1 mt-1">
                    <FiClock className="text-xs" />
                    <span>{formatEstimatedTime(estimatedStart)}</span>
                </div>
            )}

            {/* Status Badge */}
            {status === 'AVAILABLE' && (
                <span className="text-xs mt-1 text-primary font-medium">Available</span>
            )}

            {/* Current Token Indicator */}
            {isCurrent && (
                <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}

            {/* User Token Indicator */}
            {isUserToken && (
                <motion.div
                    className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}
        </motion.div>
    );
};

export default TokenChip;


