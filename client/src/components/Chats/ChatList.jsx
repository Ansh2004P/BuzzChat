import React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import useChatState from "../../hooks/useChatState";
import useAccessChat from "../../hooks/Chat/useAccessChat";
import useUser from "../../hooks/Chat/useUser";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import useGetCurrentUser from "../../hooks/useGetCurrentUser";

const ChatList = () => {
  const chats = useSelector((state) => state.chat.chats);
  const { user } = useGetCurrentUser();
  const currentUserId = user._id;
  const {
    selectedChat,
    setSelectedChat,
    setSearchResult,
    setChats,
    searchResult = [],
  } = useChatState();
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

  React.useEffect(() => {
    // console.log("Chats state from Redux:", chats);
  }, [chats]);

  const handleChatClick = async (chat) => {
    try {
      const chatData = await accessChat({
        userId: chat._id,
        isGroupChat: chat.isGroupChat,
        lastMessage: chat?.lastMessage ? [...chat.lastMessage] : [],
      });

      let newSelectedChat;
      if (!chatData.isGroupChat) {
        newSelectedChat = {
          _id: chatData.participants.find((user) => user._id !== currentUserId)
            ._id,
          user: Array.isArray(chatData.participants)
            ? chatData.participants.filter((user) => user._id !== currentUserId)
            : [],
          isGroupChat: chatData.isGroupChat,
          lastMessage: chatData.lastMessage,
          chatId: chatData._id,
        };

        setSelectedChat(newSelectedChat);

        const updatedChats = chats.map((existingChat) =>
          existingChat._id === newSelectedChat._id
            ? { ...existingChat, chatId: chatData._id }
            : existingChat
        );

        if (!updatedChats.find((chat) => chat._id === newSelectedChat._id)) {
          updatedChats.push({
            _id: newSelectedChat._id,
            email: newSelectedChat.user[0]?.email,
            username: newSelectedChat.user[0]?.username,
            avatar: newSelectedChat.user[0]?.avatar,
            lastMessage: newSelectedChat.lastMessage,
            isGroupChat: newSelectedChat.isGroupChat,
            chatId: chatData._id,
          });
        }

        setChats(updatedChats);
      } else {
        newSelectedChat = {
          _id: chatData._id,
          users: chatData.participants || [],
          isGroupChat: chatData.isGroupChat,
          admin: chatData.admin,
          createdAt: chatData.createdAt,
          chatName: chatData.chatName,
          avatar: chatData.avatar,
          lastMessage: chatData.lastMessage,
        };
        setSelectedChat(newSelectedChat);

        const chatExists = chats.some(
          (existingChat) => existingChat._id === chatData._id
        );

        if (!chatExists) {
          const updatedChats = [...chats, newSelectedChat];
          setChats(updatedChats);
        }

        setSearchResult([]);
      }

      // console.log("Updated chats after click:", chats);
    } catch (error) {
      console.error(error);
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

        if (content.length > maxLength) {
          return `${content.substring(0, maxLength - 3)}...`;
        }
        return content;
      } else {
        if (lastMessage.content.length > maxLength) {
          return `${lastMessage.content.substring(0, maxLength - 3)}...`;
        }
        return lastMessage.content;
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
      ) : chats.length || searchResult.length ? (
        <Scrollbars autoHide>
          <div>
            {(searchResult.length === 0 ? chats : searchResult).map((chat) => (
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

// {
//   "_id": "66ae84a166fc2c3aa689e160",
//   "username": "aasfd",
//   "email": "anshkpatelasdf1@gmail.com",
//   "avatar": "http://res.cloudinary.com/dhxfeld0b/image/upload/v1722713248/BuzzChat/if0jcbxj1z8ghnrgtcbx.jpg",
//   "createdAt": "2024-08-03T19:27:29.508Z",
//   "updatedAt": "2024-08-03T19:27:29.508Z",
//   "__v": 0
// },

// {
//   "_id": "66c9ba12c12efd95741a1d79",
//   "user": [
//       {
//           "_id": "66ae84a166fc2c3aa689e160",
//           "username": "aasfd",
//           "email": "anshkpatelasdf1@gmail.com",
//           "avatar": "http://res.cloudinary.com/dhxfeld0b/image/upload/v1722713248/BuzzChat/if0jcbxj1z8ghnrgtcbx.jpg",
//           "createdAt": "2024-08-03T19:27:29.508Z",
//           "updatedAt": "2024-08-03T19:27:29.508Z",
//           "__v": 0
//       },
//       {
//           "_id": "66c99b9bb32806ccb614175e",
//           "username": "pookiee 2.0",
//           "email": "xyz@234.com",
//           "avatar": "http://res.cloudinary.com/dhxfeld0b/image/upload/v1724488601/BuzzChat/tzzqcu6qwmwtcn13hsqh.jpg",
//           "createdAt": "2024-08-24T08:36:43.645Z",
//           "updatedAt": "2024-08-24T10:33:31.260Z",
//           "__v": 0
//       }
//   ],
//   "isGroupChat": false
// }

// {
//   "_id": "66b0fd7b2862c0227f02670c",
//   "username": "one12321",
//   "email": "one.abc.com",
//   "avatar": "http://res.cloudinary.com/dhxfeld0b/image/upload/v1722875255/BuzzChat/z8loycpdiq8yqwobaah6.jpg",
//   "createdAt": "2024-08-05T16:27:39.736Z",
//   "updatedAt": "2024-08-05T16:27:45.295Z",
//   "__v": 0,
//   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmIwZmQ3YjI4NjJjMDIyN2YwMjY3MGMiLCJpYXQiOjE3MjI4NzUyNjUsImV4cCI6MTcyMzczOTI2NX0.IE1yHuc2rRU6pjcoRWMzkg6gzqqT0NuGeVQFVHUBsTQ"
// }
