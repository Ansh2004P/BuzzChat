import React, { useRef, useState } from "react";
import animationData from "../../assets/animations/typing.json";

const useChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const newMessage = useRef("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

 
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
  };
};

export default useChatScreen;
