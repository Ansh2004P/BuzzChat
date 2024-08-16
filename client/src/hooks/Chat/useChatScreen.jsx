import React, { useRef, useState } from "react";
import animationData from "../../assets/animations/typing.json";

const useChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const newMessage = useRef("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing
  const [localSearchQuery, setLocalSearchQuery] = useState(""); // For local search functionality

  return {
    messages,
    setMessages,
    loading,
    setLoading,
    newMessage,
    typing,
    setTyping,
    istyping,
    setIsTyping,
    attachedFiles,
    setAttachedFiles,
    selfTyping,
    setSelfTyping,
    localSearchQuery,
    setLocalSearchQuery,

  };
};

export default useChatScreen;
