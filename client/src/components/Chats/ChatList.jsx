// src/components/ChatList.js
import React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import useChatState from "../../hooks/useChatState";
import PropTypes from "prop-types";

const ChatList = ({ chats, loading, error }) => {
  const { selectedChat, setSelectedChat, notification } = useChatState();

  // console.log(chats);
  return (
    <div className="flex flex-col py-3 my-2 w-full h-full rounded-lg overflow-hidden">
      {chats ? (
        <Scrollbars autoHide>
          <div>
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`cursor-pointer py-4 px-4 mx-1 my-2 rounded-lg w-[28vw] h-fit ${
                  selectedChat === chat
                    ? "bg-neutral-500 text-white"
                    : "bg-neutral-700 text-white"
                } hover:bg-neutral-400 hover:text-white`}
              >
                <div className="flex justify-between">
                  <div className="flex ">
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
        <p>Loading...</p>
      )}
    </div>
  );
};

ChatList.propTypes = {
  chats: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default ChatList;
