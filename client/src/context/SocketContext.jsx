import { createContext, useContext, useEffect, useState } from "react";
import socketio from "socket.io-client";
import PropTypes from "prop-types";

const getSocket = () => {
  return socketio(import.meta.env.VITE_SOCKET_URI, {
    withCredentials: true,
  });
};

const SocketContext = createContext({
  socket: null,
});

const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(getSocket());
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { useSocket, SocketProvider };
