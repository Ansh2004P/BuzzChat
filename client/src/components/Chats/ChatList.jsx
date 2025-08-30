import React, { useCallback, useEffect } from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { useSelector } from "react-redux";
import useChatState from "../../hooks/useChatState";
import useAccessChat from "../../hooks/Chat/useAccessChat";
import useUser from "../../hooks/Chat/useUser";
import { toast } from "react-toastify";
import useGetCurrentUser from "../../hooks/useGetCurrentUser";
import axios from "axios";

const ChatList = () => {
  const { user } = useGetCurrentUser();
  const currentUserId = user._id;
  
  // Use Redux selector to compute display list
  const displayList = useSelector((state) => {
    const { chats, searchResult, isSearching } = state.chat;
    return isSearching && searchResult.length > 0 ? searchResult : chats;
  });
  
  const {
    chats,
    selectedChat,
    setSelectedChat,
    setSearchResult,
    setChats,
    searchResult = [],
    isSearching,
  } = useChatState();

  // Display list is now computed by Redux selector above

  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useUser();

  const {
    mutateAsync: accessChat,
    isLoading: isAccessChatLoading,
    error: accessChatError,
  } = useAccessChat();

  // const fetchChat = useCallback(async () => {
  //   console.log("Fetching chats");
  //   try {
  //     const { data } = await axios.get(
  //       `${import.meta.env.VITE_SERVER_URI}/chat`,
  //       {
  //         withCredentials: true,
  //       }
  //     );

  //     const uniqueParticipants = {};

  //     data.data.forEach((element) => {
  //       if (element.isGroupChat) {
  //         uniqueParticipants[element._id] = {
  //           _id: element._id,
  //           username: element.chatName,
  //           avatar: element.avatar,
  //           isGroupChat: true,
  //           participants: element.participants,
  //           lastMessage: element.lastMessage,
  //         };
  //       } else {
  //         element.participants.forEach((participant) => {
  //           if (participant._id !== currentUserId) {
  //             uniqueParticipants[participant._id] = {
  //               ...participant,
  //               lastMessage: [...element.lastMessage],
  //               isGroupChat: false,
  //             };
  //           }
  //         });
  //       }
  //     });

  //     const uniqueParticipantsArray = Object.values(uniqueParticipants);

  //     setChats(uniqueParticipantsArray);

  //     // 🛠️ only set searchResult if it's empty (prevents overwriting active search)
  //     if (!searchResult.length) {
  //       setSearchResult(uniqueParticipantsArray);
  //     }
  //   } catch (error) {
  //     toast.error("Error fetching chats", {
  //       position: "bottom-center",
  //       autoClose: 5000,
  //       closeButton: true,
  //       theme: "dark",
  //       pauseOnHover: false,
  //     });
  //   }
  // }, [currentUserId, setChats, setSearchResult, searchResult.length]);

  useEffect(() => {
    // fetchChat();
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChatClick = async (chat) => {
    try {
      // For group chats, we already have all the data we need
      if (chat.isGroupChat) {
        const selectedChat = {
          _id: chat._id,
          isGroupChat: true,
          chatName: chat.username, // This is set to chatName in MyChats processing
          avatar: chat.avatar,
          participants: chat.participants || [],
          admin: chat.admin || [],
          lastMessage: chat.lastMessage || [],
        };
        setSelectedChat(selectedChat);
        return;
      }

      // For individual chats - check if this is a search result or existing chat
      let chatData;
      let selectedChat;

      if (chat.isSearchResult || !chat.chatId) {
        // This is a new user from search results - create/access the chat
        chatData = await accessChat({
          userId: chat._id,
          isGroupChat: false,
        });

        selectedChat = {
          _id: chat._id, // User ID for display purposes
          chatId: chatData._id, // Actual chat ID for API calls
          isGroupChat: false,
          participants: chatData.participants || [chat],
          lastMessage: chatData.lastMessage || [],
          // Add user info for display
          username: chat.username,
          email: chat.email,
          avatar: chat.avatar,
        };

        // If this was a search result, add it to the main chat list
        if (chat.isSearchResult) {
          const newChatItem = {
            ...chat,
            chatId: chatData._id,
            isSearchResult: false,
          };
          
          // Add to chats if not already there
          const existingChatIndex = chats.findIndex(c => c._id === chat._id);
          if (existingChatIndex === -1) {
            setChats([newChatItem, ...chats]);
          }
        }
      } else {
        // This is an existing chat
        selectedChat = {
          _id: chat._id, // User ID for display purposes
          chatId: chat.chatId, // Actual chat ID for API calls
          isGroupChat: false,
          participants: [], // Will be populated by the component
          lastMessage: chat.lastMessage || [],
          // Add user info for display
          username: chat.username,
          email: chat.email,
          avatar: chat.avatar,
        };
      }

      setSelectedChat(selectedChat);

    } catch (error) {
      console.error("Error accessing chat:", error);
      toast.error("Failed to open chat", {
        position: "bottom-center",
        theme: "dark",
      });
    }
  };

  const renderLastMessage = (chat) => {
    const maxLength = 20;
    const lastMessage = chat.lastMessage?.[0];

    if (lastMessage) {
      if (chat.isGroupChat) {
        const senderId = lastMessage.sender;
        const sender = chat.participants.find(
          (participant) => participant._id === senderId
        );
        const content = sender
          ? `${sender.username}: ${lastMessage.content}`
          : lastMessage.content;

        return content.length > maxLength
          ? `${content.substring(0, maxLength - 3)}...`
          : content;
      } else {
        return lastMessage.content.length > maxLength
          ? `${lastMessage.content.substring(0, maxLength - 3)}...`
          : lastMessage.content;
      }
    }
    return "No messages";
  };

  if (isUserLoading) return <p>Loading user...</p>;
  if (userError) return <p>Error loading user: {userError.message}</p>;

  return (
    <div className="flex flex-col py-3 my-2 w-full h-full rounded-lg overflow-hidden">
      {accessChatError ? (
        <p>Error accessing chat: {accessChatError.message}</p>
      ) : 
      searchResult.length ? (
        <Scrollbars autoHide>
          <div>
            {searchResult.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className={`cursor-pointer py-4 px-4 mx-1 my-2 rounded-lg w-[28vw] h-fit ${
                  selectedChat?._id === chat._id
                    ? "bg-neutral-500 text-white"
                    : "bg-neutral-700 text-white"
                } hover:bg-neutral-400 hover:text-white`}
              >
                <div className="flex justify-between">
                  <div className="flex">
                    <img
                      src={chat.avatar}
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white"
                    />
                    <div className="flex flex-col relative">
                      <span className="ml-2 sm:ml-4 md:ml-6 lg:ml-10 font-semibold text-base sm:text-lg">
                        {chat.username || chat.chatName}
                      </span>
                      <span className="text-stone-400 w-[60%] sm:w-[50%] md:w-[40%] md:mx-[26%] lg:w-[30%] mt-1 sm:mt-2 h-5 text-ellipsis whitespace-nowrap">
                        {renderLastMessage(chat)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Scrollbars>
      ) : chats.length ? (
        <Scrollbars autoHide>
          <div>
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className={`cursor-pointer py-4 px-4 mx-1 my-2 rounded-lg w-[28vw] h-fit ${
                  selectedChat?._id === chat._id
                    ? "bg-neutral-500 text-white"
                    : "bg-neutral-700 text-white"
                } hover:bg-neutral-400 hover:text-white`}
              >
                <div className="flex justify-between">
                  <div className="flex">
                    <img
                      src={chat.avatar}
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white"
                    />
                    <div className="flex flex-col relative">
                      <span className="ml-2 sm:ml-4 md:ml-6 lg:ml-10 font-semibold text-base sm:text-lg">
                        {chat.username || chat.chatName}
                      </span>
                      <span className="text-stone-400 w-[60%] sm:w-[50%] md:w-[40%] md:mx-[26%] lg:w-[30%] mt-1 sm:mt-2 h-5 text-ellipsis whitespace-nowrap">
                        {renderLastMessage(chat)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Scrollbars>
      ) : (
        <p>No chats available</p>
      )}
    </div>
  );
};

export default ChatList;
