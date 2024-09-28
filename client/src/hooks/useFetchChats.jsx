import { useState, useEffect } from "react";
import axios from "axios";
import useChatState from "./useChatState";
import { extractErrorMessage, VITE_SERVER_URI } from "../utils/utils";
import { toast } from "react-toastify";

const useFetchChat = () => {
  const { chats, setChats } = useChatState();

  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${VITE_SERVER_URI}/user/get-users`,
        {
          withCredentials: true,
        }
      );
      setChats(response.data.data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err.response.data);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return { chats, loading };
};

export default useFetchChat;
