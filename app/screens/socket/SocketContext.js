// filepath: e:\NTN_TaiLieu\HK8\CNM\AppChat_Sophy\app\screens\socket\SocketContext.js
import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:3000";

export const SocketContext = createContext(null); // Initialize with null

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};