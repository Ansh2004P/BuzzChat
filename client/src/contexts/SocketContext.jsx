import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import useGetCurrentUser from '../hooks/useGetCurrentUser';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { user } = useGetCurrentUser();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user?._id && !socketRef.current) {
      // Create socket connection
      const newSocket = io(import.meta.env.VITE_SOCKET_URI, {
        transports: ['websocket'],
        upgrade: false,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Setup socket events
      newSocket.emit('setup', user);
      
      newSocket.on('connected', () => {
        setSocketConnected(true);
        console.log('Socket connected');
      });

      newSocket.on('disconnect', () => {
        setSocketConnected(false);
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
      });
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setSocketConnected(false);
      }
    };
  }, [user?._id]);

  const value = {
    socket: socketRef.current,
    socketConnected,
    isConnected: socketConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
