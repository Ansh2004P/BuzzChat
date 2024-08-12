import React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import useChatState from "../../hooks/useChatState";
import PropTypes from "prop-types";
import useGetCurrentUser from "../../hooks/useGetCurrentUser";
import useAccessChat from "../../hooks/Chat/useAccessChat";
import useUser from "../../hooks/Chat/useUser";

const ChatList = React.memo(function ChatList({ chats }) {
  const { selectedChat, setSelectedChat, notification } = useChatState();
  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useUser(); // Fetch current user details
  const {
    mutateAsync: accessChat,
    isLoading: isAccessChatLoading,
    error: accessChatError,
  } = useAccessChat();

  const handleChatClick = async (userId) => {
    try {
      const chatData = await accessChat(userId);

      setSelectedChat({
        _id: chatData._id,
        user: Array.isArray(chatData.participants)
          ? chatData.participants.filter((user) => user._id !== currentUser._id)
          : [],
      });
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  if (isUserLoading) return <p>Loading user...</p>;
  if (userError) return <p>Error loading user: {userError.message}</p>;

  return (
    <div className="flex flex-col py-3 my-2 w-full h-full rounded-lg overflow-hidden">
      {isAccessChatLoading ? (
        <p>Loading chats...</p>
      ) : accessChatError ? (
        <p>Error accessing chat: {accessChatError.message}</p>
      ) : chats.length ? (
        <Scrollbars autoHide>
          <div>
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatClick(chat._id)}
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
                    <span className="ml-10 font-semibold text-lg">
                      {chat.username}
                    </span>
                  </div>
                  {notification[chat._id] > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-2">
                      {notification[chat._id]}
                    </span>
                  )}
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
});

ChatList.propTypes = {
  chats: PropTypes.array.isRequired,
};

export default ChatList;
