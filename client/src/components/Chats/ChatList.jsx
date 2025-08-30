import React from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { useSelector } from "react-redux";
import useChatState from "../../hooks/useChatState";
import useUser from "../../hooks/Chat/useUser";
import useAccessChat from "../../hooks/Chat/useAccessChat";
import { toast } from "react-toastify";

const ChatList = () => {
  const { data: currentUser, isLoading: isUserLoading, error: userError } = useUser();
  const { selectedChat, setSelectedChat, chats: reduxChats, searchResult, isSearching } = useChatState();
  const { mutateAsync: accessChat, error: accessChatError } = useAccessChat();

  // Redux selector: compute display list
  const displayList = useSelector((state) => {
    return state.chat.isSearching && state.chat.searchResult.length > 0
      ? state.chat.searchResult
      : state.chat.chats;
  });

  const handleChatClick = async (chat) => {
    try {
      if (chat.isGroupChat) {
        setSelectedChat({
          _id: chat._id,
          isGroupChat: true,
          chatName: chat.chatName || chat.username,
          avatar: chat.avatar,
          participants: chat.participants || [],
          admin: chat.admin || [],
          lastMessage: chat.lastMessage || [],
        });
        return;
      }

      let selectedChatData;
      if (chat.isSearchResult || !chat.chatId) {
        const chatData = await accessChat({ userId: chat._id, isGroupChat: false });
        selectedChatData = {
          _id: chat._id,
          chatId: chatData._id,
          isGroupChat: false,
          participants: chatData.participants || [chat],
          lastMessage: chatData.lastMessage || [],
          username: chat.username,
          email: chat.email,
          avatar: chat.avatar,
        };
      } else {
        selectedChatData = {
          _id: chat._id,
          chatId: chat.chatId,
          isGroupChat: false,
          participants: [],
          lastMessage: chat.lastMessage || [],
          username: chat.username,
          email: chat.email,
          avatar: chat.avatar,
        };
      }

      setSelectedChat(selectedChatData);
    } catch (error) {
      console.error("Error accessing chat:", error);
      toast.error("Failed to open chat", { position: "bottom-center", theme: "dark" });
    }
  };

  console.log("a", displayList)

  const renderLastMessage = (chat) => {
    const lastMessage = chat.lastMessage?.[0];
    if (!lastMessage) return "No messages";

    const maxLength = 20;
    let content = lastMessage.content;

    if (chat.isGroupChat) {
      const sender = chat.participants.find((p) => p._id === lastMessage.sender);
      if (sender) content = `${sender.username}: ${lastMessage.content}`;
    }

    return content.length > maxLength ? `${content.substring(0, maxLength - 3)}...` : content;
  };

  if (isUserLoading) return <p>Loading user...</p>;
  if (userError) return <p>Error loading user: {userError.message}</p>;

  return (
    <div className="flex flex-col py-3 my-2 w-full h-full rounded-lg overflow-hidden">
      {accessChatError && <p>Error accessing chat: {accessChatError.message}</p>}

      {!accessChatError && displayList.length === 0 && (
        <p className="text-center text-gray-400">No chats available</p>
      )}

      {!accessChatError && displayList.length > 0 && (
        <Scrollbars autoHide>
          {displayList.map((chat) => (
            <div
              key={chat._id}
              onClick={() => handleChatClick(chat)}
              className={`cursor-pointer py-4 px-4 mx-1 my-2 rounded-lg w-[28vw] h-fit ${
                selectedChat?._id === chat._id ? "bg-neutral-500 text-white" : "bg-neutral-700 text-white"
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
        </Scrollbars>
      )}
    </div>
  );
};

export default ChatList;
