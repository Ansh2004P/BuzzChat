// src/hooks/useSocket.js
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { updateLastMessage } from "../../utils/redux/chatSlice";

const useSocket = (
  user,
  selectedChat,
  setMessages,
  setNotification,
  fetchAgain,
  setFetchAgain,
  setIsTyping,
  setTyping,
  socketURI
) => {
  const [socketConnected, setSocketConnected] = useState(false);
  var socket;

  useEffect(() => {
    const socket = io(socketURI);

    socket.emit("setup", user[0]);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));
    socket.on("connected", () => setSocketConnected(true));

    socket.on("messageReceived", (newMessageReceived) => {
      setMessages((prevMessages) => [newMessageReceived, ...prevMessages]);
      // Update lastMessage in chat state
      updateLastMessage(
        selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId,
        newMessageReceived
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [
    user,
    selectedChat,
    socketURI,
    setMessages,
    setNotification,
    fetchAgain,
    setFetchAgain,
    setIsTyping,
    setTyping,
  ]);

  return { socket, socketConnected };
};

export default useSocket;
