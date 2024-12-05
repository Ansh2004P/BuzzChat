import React from "react";

const List = ({ chats, handleChatClick, selectedChat, renderLastMessage }) => {
  return chats.map((chat) => (
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
  ));
};

export default List;
