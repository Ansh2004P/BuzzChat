import React, { useMemo } from "react";
import Heading from "./Heading";
import SearchBar from "../SearchBar";
import ChatList from "./ChatList";
import PropTypes from "prop-types";
import { useChats } from "../../hooks/queries/chatQueries";
import useChatState from "../../hooks/useChatState";
import Loader from "../Loader";

const MyChats = ({ currUserId }) => {
  const { data: chatsData, isLoading, error } = useChats();
  const { setChats, setSearchResult } = useChatState();
  const [isSearching, setIsSearching] = React.useState(false);

  // Memoize the processed chats to avoid unnecessary recalculations
  const processedChats = useMemo(() => {
    if (!chatsData || !Array.isArray(chatsData)) return [];
    
    const uniqueParticipants = {};

    chatsData.forEach((element) => {
      if (element.isGroupChat) {
        uniqueParticipants[element._id] = {
          _id: element._id,
          username: element.chatName,
          avatar: element.avatar,
          isGroupChat: true,
          participants: element.participants,
          admin: element.admin || [],
          lastMessage: Array.isArray(element.lastMessage) ? element.lastMessage : [],
        };
      } else {
        element.participants.forEach((participant) => {
          if (participant._id !== currUserId) {
            // Ensure lastMessage is always an array
            const lastMessage = element.lastMessage;
            const lastMessageArray = Array.isArray(lastMessage) 
              ? lastMessage 
              : lastMessage 
                ? [lastMessage] 
                : [];
                
            uniqueParticipants[participant._id] = {
              ...participant,
              lastMessage: lastMessageArray,
              isGroupChat: false,
              chatId: element._id, // Store the original chat ID for API calls
            };
          }
        });
      }
    });

    return Object.values(uniqueParticipants);
  }, [chatsData, currUserId]);

  // Update Redux state when processed chats change
  React.useEffect(() => {
    // Always update chats, even if empty (to handle cases like all chats being deleted)
    setChats(processedChats);
    // Only update search results to match current chats when not actively searching
    if (!isSearching) {
      setSearchResult(processedChats);
    }
  }, [processedChats, setChats, setSearchResult, isSearching]);

  // Handle search state changes
  const handleSearchStateChange = React.useCallback((searching) => {
    setIsSearching(searching);
    // If search is turned off, reset to show all chats
    if (!searching) {
      setSearchResult(processedChats);
    }
  }, [processedChats, setSearchResult]);

  const handleSearchResult = React.useCallback((results) => {
    setSearchResult(results);
  }, [setSearchResult]);

  if (isLoading) {
    return (
      <div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-2 ml-4 text-white flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-2 ml-4 text-white flex flex-col items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Failed to load chats</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-emerald-700 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-2 ml-4 text-white flex flex-col">
      <Heading />
      <SearchBar 
        onSearchResult={handleSearchResult} 
        initialResult={processedChats}
        onSearchStateChange={handleSearchStateChange}
      />
      <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700" />
      <ChatList />
    </div>
  );
};

MyChats.propTypes = {
  currUserId: PropTypes.string.isRequired,
};

export default MyChats;
