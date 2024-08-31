import Heading from "./Heading";
import SearchBar from "../SearchBar";
import { useEffect, useCallback } from "react";
import ChatList from "./ChatList";
import axios from "axios";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import useChatState from "../../hooks/useChatState";

const MyChats = ({ currUserId }) => {
  const { chats, setChats, setSearchResult } = useChatState();

  const fetchChat = useCallback(async () => {
    // console.log("Fetching chats");
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URI}/chat`,
        {
          withCredentials: true,
        }
      );

      // console.log(data.data);
      // console.log(data.data);

      const uniqueParticipants = {};

      data.data.forEach((element) => {
        // console.log("element", element);
        if (element.isGroupChat) {
          uniqueParticipants[element._id] = {
            _id: element._id,
            username: element.chatName,
            avatar: element.avatar,
            isGroupChat: true,
            participants: element.participants,
            lastMessage: element.lastMessage,
          };
        } else {
          element.participants.forEach((participant) => {
            // console.log(element.lastMessage);
            // console.log("participant single chat", participant);
            if (participant._id !== currUserId) {
              uniqueParticipants[participant._id] = participant;
            }
          });
        }
      });

      const uniqueParticipantsArray = Object.values(uniqueParticipants);
      // console.log(uniqueParticipantsArray);

      setChats(uniqueParticipantsArray); // Update the initial chat list in Redux
      setSearchResult(uniqueParticipantsArray); // Update search results in Redux
    } catch (error) {
      toast.error("Error fetching chats", {
        position: "bottom-center",
        autoClose: 5000,
        closeButton: true,
        theme: "dark",
        pauseOnHover: false,
      });
    }
  }, [currUserId, setChats, setSearchResult]);

  // console.log(chats);
  useEffect(() => {
    fetchChat();
  }, []);

  console.log("Chats", chats);

  return (
    <div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-2 ml-4 text-white flex flex-col">
      <Heading />
      <SearchBar onSearchResult={setSearchResult} initialResult={chats} />
      <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700" />
      <ChatList />
    </div>
  );
};

MyChats.propTypes = {
  currUserId: PropTypes.string.isRequired,
};

export default MyChats;
