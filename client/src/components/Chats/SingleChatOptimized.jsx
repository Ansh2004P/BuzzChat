import React, { useState, useCallback, useEffect, useRef } from "react";
import ChatInfo from "./ChatInfo";
import ChatModal from "./ChatModal";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Loader from "../Loader";
import ScrollableChat from "./ScrollableChat";
import PropTypes from "prop-types";
import useChatState from "../../hooks/useChatState";
import { useSocket } from "../../contexts/SocketContext";
import { useChatMessages, useSendMessage } from "../../hooks/queries/chatQueries";
import useGetCurrentUser from "../../hooks/useGetCurrentUser";
import GroupChatModal from "./GroupChatmodal";
import TypingIndicator from "./TypingIndicator";
import ErrorBoundary from "../ErrorBoundary";

const SingleChat = React.memo(() => {
  const { user: currentUser } = useGetCurrentUser();
  const { selectedChat, updateLastMessage } = useChatState();
  const { socket, isConnected } = useSocket();
  
  // Get chat ID properly
  const chatId = selectedChat?.isGroupChat ? selectedChat._id : selectedChat?.chatId;
  
  // Use TanStack Query for messages
  const { data: messages = [], isLoading: messagesLoading, refetch } = useChatMessages(chatId);
  const sendMessageMutation = useSendMessage();
  
  // Local state
  const [showProfile, setShowProfile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const newMessageRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected || !chatId) return;

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);
    const handleMessageReceived = (newMessage) => {
      // Update messages in the cache through React Query
      // This will be handled by the socket in a more centralized way
      if (newMessage.chat === chatId) {
        refetch(); // Refetch messages to get the latest
        updateLastMessage(chatId, newMessage);
      }
    };

    // Join chat room
    socket.emit("joinChat", chatId);
    
    // Listen for events
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messageReceived", handleMessageReceived);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messageReceived", handleMessageReceived);
    };
  }, [socket, isConnected, chatId, refetch, updateLastMessage]);

  const handleShowProfile = useCallback(() => setShowProfile(true), []);
  const handleCloseProfile = useCallback(() => setShowProfile(false), []);

  const sendMessage = useCallback(
    async (e) => {
      if ((e.key === "Enter" && newMessageRef.current?.value.trim()) || e.type === "click") {
        const messageContent = newMessageRef.current?.value.trim();
        if (!messageContent) return;

        // Stop typing
        if (socket && typing) {
          socket.emit("stopTyping", chatId);
          setTyping(false);
        }

        // Create temporary message for optimistic update
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          content: messageContent,
          sender: {
            _id: currentUser._id,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
          chat: chatId,
          createdAt: new Date().toISOString(),
          isTemporary: true, // Flag to identify temporary messages
        };

        // Clear input immediately for better UX
        if (newMessageRef.current) {
          newMessageRef.current.value = "";
        }

        try {
          const formData = new FormData();
          formData.append("content", messageContent);

          // Send message using React Query mutation with optimistic update
          const response = await sendMessageMutation.mutateAsync({
            chatId,
            formData,
            tempMessage, // Pass temporary message for optimistic update
          });

          // Emit to socket for real-time updates to other users
          if (socket) {
            socket.emit("messageReceived", response.data.data);
          }

          // Update last message in chat list
          updateLastMessage(chatId, response.data.data);
        } catch (error) {
          console.error("Failed to send message:", error);
          // The mutation will handle rolling back the optimistic update
        }
      }
    },
    [socket, typing, chatId, sendMessageMutation, updateLastMessage, currentUser]
  );

  const typingHandler = useCallback(() => {
    if (!socket || !isConnected) return;

    const messageContent = newMessageRef.current?.value.trim();
    
    if (messageContent && !typing) {
      setTyping(true);
      socket.emit("typing", chatId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (typing) {
        setTyping(false);
        socket.emit("stopTyping", chatId);
      }
    }, 3000);

    // Stop typing if input is empty
    if (!messageContent && typing) {
      setTyping(false);
      socket.emit("stopTyping", chatId);
    }
  }, [socket, isConnected, chatId, typing]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (messagesLoading) {
    return (
      <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Get display user info
  const displayUser = selectedChat?.isGroupChat
    ? null
    : {
        _id: selectedChat?._id,
        username: selectedChat?.username,
        avatar: selectedChat?.avatar,
        email: selectedChat?.email,
      };

  const displayName = selectedChat?.isGroupChat
    ? selectedChat.chatName
    : selectedChat?.username || "Unknown User";

  const displayAvatar = selectedChat?.isGroupChat
    ? selectedChat.avatar
    : selectedChat?.avatar;

  return (
    <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex flex-col">
      {/* Chat Header */}
      <div className="bg-emerald-700 w-full h-fit rounded-t-2xl flex justify-between">
        <span className="text-white font-semibold font-sans text-xl p-6 ml-8">
          {displayName}
        </span>
        <div className="flex w-fit space-x-2 mr-4 p-2">
          <div onClick={handleShowProfile} className="ml-10 px-2 cursor-pointer">
            <ChatInfo
              avatar={displayAvatar}
              wsize="50px"
              hsize="50px"
            />
          </div>
        </div>
        
        {/* Profile Modal */}
        {showProfile && (
          <ErrorBoundary>
            {!selectedChat.isGroupChat ? (
              <ChatModal
                currUser={currentUser}
                onclose={handleCloseProfile}
                selectedChatUser={displayUser}
              />
            ) : (
              <GroupChatModal onClose={handleCloseProfile} />
            )}
          </ErrorBoundary>
        )}
      </div>

      {/* Messages Area */}
      <div className="bg-neutral-800 h-[78%] w-full p-4">
        <div className="w-full h-full">
          <ScrollableChat
            messages={messages}
            id={currentUser._id}
            groupChat={selectedChat.isGroupChat}
          />
        </div>
      </div>
      
      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Message Input */}
      <div className="h-[8%] w-[100%] rounded-b-2xl bg-stone-700 flex pl-2">
        <input
          className="ml-3 px-3 w-[89%] h-full bg-stone-700 focus:outline-none placeholder:text-gray-500 text-white"
          placeholder="Type a message"
          ref={newMessageRef}
          type="text"
          onChange={typingHandler}
          onKeyDown={sendMessage}
          disabled={sendMessageMutation.isLoading}
        />
        <ArrowRightIcon
          onClick={sendMessage}
          className={`h-8 w-8 text-white mx-3 my-auto cursor-pointer hover:bg-stone-600 rounded-full ${
            sendMessageMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
});

SingleChat.displayName = 'SingleChat';

SingleChat.propTypes = {
  fetchAgain: PropTypes.bool,
  setFetchAgain: PropTypes.func,
};

export default SingleChat;
