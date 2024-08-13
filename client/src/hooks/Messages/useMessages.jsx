// src/hooks/useMessages.js

import { useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useMessages = (selectedChat, setMessages, setLoading) => {
  const cancelTokenRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      // Cancel the previous request if it exists
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Operation canceled due to new request.");
      }

      const source = axios.CancelToken.source();
      cancelTokenRef.current = source;

      try {
        const config = {
          withCredentials: true,
          cancelToken: source.token,
        };

        setLoading(true);

        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_URI}/message/${
            selectedChat._id
          }?chatId=${selectedChat._id}`,
          config
        );
        setMessages(data.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          toast.error("Failed to fetch messages", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Operation canceled by the user.");
      }
    };
  }, [selectedChat, setMessages, setLoading]);
};

export default useMessages;
