import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

/**
 * Custom hook for Socket.IO queue updates
 * 
 * @param {string} slotId - The slot ID to subscribe to
 * @param {string} userId - Current user ID (to identify user's token)
 * @param {string} backendUrl - Backend URL for socket connection
 * @returns {object} { queueData, isConnected, error }
 */
export const useQueueSocket = (slotId, userId = null, backendUrl = 'http://localhost:4000') => {
    const [queueData, setQueueData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!slotId) return;

        // Initialize socket connection
        const socket = io(backendUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
            setError(null);

            // Join slot room
            const room = `slot_${slotId}`;
            socket.emit('join:slot', slotId);
            console.log(`Joined room: ${room}`);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setError(err.message);
            setIsConnected(false);
        });

        // Queue update event
        socket.on('slot:update', (data) => {
            console.log('Received slot:update:', data);
            setQueueData(data);

            // Show toast notification if queue changed
            if (data.tokens && userId) {
                const userToken = data.tokens.find(t => t.userId === userId);
                if (userToken) {
                    const estimatedStart = new Date(userToken.estimatedStart);
                    const timeStr = estimatedStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    toast.info(`Queue updated! Your estimated time: ${timeStr}`, {
                        position: 'bottom-right',
                        autoClose: 3000
                    });
                }
            }
        });

        // Appointment completed event
        socket.on('appointment:completed', (data) => {
            console.log('Appointment completed:', data);
            // Queue will be updated via slot:update
        });

        // New booking event
        socket.on('slot:booked', (data) => {
            console.log('New booking:', data);
            // Queue will be updated via slot:update
        });

        // Appointment cancelled event
        socket.on('appointment:cancelled', (data) => {
            console.log('Appointment cancelled:', data);
            // Queue will be updated via slot:update
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave:slot', slotId);
                socketRef.current.disconnect();
            }
        };
    }, [slotId, userId, backendUrl]);

    return { queueData, isConnected, error };
};

export default useQueueSocket;


