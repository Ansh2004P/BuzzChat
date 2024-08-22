import React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import useChatState from "../../hooks/useChatState";
import useAccessChat from "../../hooks/Chat/useAccessChat";
import useUser from "../../hooks/Chat/useUser";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ChatList = () => {
  const chats = useSelector((state) => state.chat.chats);
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

  // console.log("chatssss", chats);

  const handleChatClick = async (chat) => {
    try {
      const chatData = await accessChat({
        userId: chat._id,
        isGroupChat: chat.isGroupChat,
      });
      console.log(chatData);

      if (!chatData.isGroupChat) {
        setSelectedChat({
          _id: chatData._id,
          user: Array.isArray(chatData.participants)
            ? chatData.participants.filter(
                (user) => user._id !== currentUser._id
              )
            : [],
          isGroupChat: chatData.isGroupChat,
        });
      } else {
        setSelectedChat({
          _id: chatData._id,
          users: chatData.participants,
          isGroupChat: chatData.isGroupChat,
          admin: chatData.admin,
          createdAt: chatData.createdAt,
          chatName: chatData.chatName,
          avatar: chatData.avatar,
        });
      }
    } catch (error) {
      toast.error("Error accessing chat", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    }
  };

  if (isUserLoading) return <p>Loading user...</p>;
  if (userError) return <p>Error loading user: {userError.message}</p>;

  return (
    <div className="flex flex-col py-3 my-2 w-full h-full rounded-lg overflow-hidden">
      {accessChatError ? (
        <p>Error accessing chat: {accessChatError.message}</p>
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
                    <span className="ml-10 font-semibold text-lg">
                      {chat.username || chat.chatName}
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
};

export default ChatList;
