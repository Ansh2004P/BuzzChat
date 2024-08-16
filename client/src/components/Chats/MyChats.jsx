import Heading from "./Heading";
import SearchBar from "../SearchBar";
import { useEffect, useState, useCallback } from "react";
import ChatList from "./ChatList";
import axios from "axios";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const MyChats = ({ currUserId }) => {
  const [searchResult, setSearchResult] = useState([]);
  const [initialResult, setInitialResult] = useState([]);

  const fetchChat = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URI}/chat`,
        {
          withCredentials: true,
        }
      );

      const uniqueParticipants = {};

      data.data.forEach((element) => {
        if (element.isGroupChat) return;

        element.participants.forEach((participant) => {
          if (participant._id !== currUserId) {
            uniqueParticipants[participant._id] = participant;
          }
        });
      });

      const uniqueParticipantsArray = Object.values(uniqueParticipants);

      setSearchResult(uniqueParticipantsArray);
      setInitialResult(uniqueParticipantsArray);
    } catch (error) {
      toast.error("Error fetching chats", {
        position: "bottom-center",
        autoClose: 5000,
        closeButton: true,
        theme: "dark",
        pauseOnHover: false,
      });
    }
  }, [currUserId]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  return (
    <div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-2 ml-4 text-white flex flex-col">
      <Heading />
      <SearchBar
        onSearchResult={setSearchResult}
        initialResult={initialResult}
      />

      <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700" />

      <ChatList chats={searchResult} />
    </div>
  );
};

MyChats.propTypes = {
  currUserId: PropTypes.string.isRequired,
};

export default MyChats;
