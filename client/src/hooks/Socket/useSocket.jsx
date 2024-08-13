// src/hooks/useSocket.js

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const useSocket = (
  user,
  selectedChat,
  setMessages,
  setFetchAgain,
  setNotification,
  setIsTyping
) => {
  const socket = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    socket.current = io(`http://localhost:8000`);

    socket.current.emit("setup", user);

    socket.current.on("connected", () => setSocketConnected(true));
    socket.current.on("typing", () => setIsTyping(true));
    socket.current.on("stopTyping", () => setIsTyping(false));

    socket.current.on("messageRecieved", (newMessageRecieved) => {
      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        setNotification((prev) => [newMessageRecieved, ...prev]);
        setFetchAgain((prev) => !prev);
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    });

    socket.current.on("connect_error", (err) => {
      console.error("Connection Error:", err);
    });

    socket.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.current.connect();
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user, selectedChat, setFetchAgain, setMessages, setNotification]);

  return { socket, socketConnected };
};

export default useSocket;
