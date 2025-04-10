import React, { createContext, useState, useEffect, useCallback } from 'react'; // Import useCallback
import io from 'socket.io-client';

// Use your actual backend URL
const SOCKET_SERVER_URL = "http://192.168.1.240:3000";// Replace with your local IP or production URL

export const SocketContext = createContext(null);

export const SocketProvider = React.memo(({ children }) => { // Use React.memo
  const [socket, setSocket] = useState(null);

  const initializeSocket = useCallback(() => { // Use useCallback
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Debug connection status
    newSocket.on('connect', () => {
      console.log('Socket Connected:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket Connection Error:', error);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket Reconnected (attempt #', attemptNumber, '):', newSocket.id);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect:', attemptNumber);
    });

    newSocket.on('reconnecting', (attemptNumber) => {
      console.log('Reconnecting:', attemptNumber);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnect Error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Reconnect Failed');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket Disconnected:', reason);
    });

    setSocket(newSocket);

    return newSocket; // Return the socket for cleanup
  }, []);

  useEffect(() => {
    const socketInstance = initializeSocket(); // Initialize socket

    return () => {
      if (socketInstance) {
        console.log('Disconnecting socket...');
        socketInstance.disconnect();
      }
    };
  }, [initializeSocket]); // Add initializeSocket to dependencies

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
});