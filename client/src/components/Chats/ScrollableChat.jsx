import React, { useRef, useEffect, useMemo } from "react";
import Scrollbars from "react-custom-scrollbars";
import PropTypes from "prop-types";
import ChatInfo from "./ChatInfo";

// Function to generate a color based on a string (sender ID)
const getColorFromId = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${(hash & 0x00ffffff).toString(16).padStart(6, "0")}`;
  return color;
};

// Memoized Message component to avoid unnecessary re-renders
const Message = React.memo(function Message({ message, id, groupChat }) {
  const senderColor =
    message.sender._id !== id ? getColorFromId(message.sender._id) : undefined;

  return (
    <div
      className={`flex ${
        message.sender._id === id ? "flex-row-reverse" : "flex-row"
      } items-start space-x-2 my-2`}
    >
      {message.sender._id !== id && groupChat && (
        <div className="mr-2">
          <ChatInfo
            avatar={message.sender.avatar}
            wsize={"40px"}
            hsize={"40px"}
          />
        </div>
      )}
      <div
        className={`relative py-2 px-4 my-2 ${
          message.sender._id === id
            ? "bg-emerald-700 text-white rounded-l-lg rounded-br-lg mr-2"
            : "bg-neutral-700 text-white rounded-b-lg rounded-t-lg"
        } ${message.sender._id === id ? "ml-2" : "mr-2"}`}
      >
        {message.sender._id !== id && groupChat && (
          <span
            className="flex flex-col text-left -mx-1 font-normal text-xs -mt-1 my-1"
            style={{ color: senderColor }}
          >
            {message.sender.username}
          </span>
        )}
        <span className="flex text-left -mx-1 font-normal text-sm text-white my-1">
          {message.content}
        </span>
        {message.sender._id === id ? (
          <>
            <div className="absolute top-0 right-[-8px] h-[12px] w-[20px] bg-emerald-700" />
            <div className="absolute top-[1px] right-[-8px] h-[12px] w-[8px] bg-neutral-800 rounded-tl-lg" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-4 h-4 bg-neutral-700 rounded-bl-lg transform -translate-x-2 -translate-y-3/2" />
            <div className="absolute top-0 left-0 w-4 h-4 bg-neutral-800 rounded-tr-lg transform -translate-x-4 -translate-y-3/2" />
          </>
        )}
      </div>
    </div>
  );
});

// Main ScrollableChat component
const ScrollableChat = ({ messages, id, groupChat }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (scrollRef.current) {
      scrollRef.current.scrollToBottom();
    }
  }, [messages]);

  // Memoize reversed messages
  const reversedMessages = useMemo(
    () => messages.slice().reverse(),
    [messages]
  );

  return (
    <Scrollbars autoHide ref={scrollRef}>
      <div>
        {reversedMessages.map((message, index) => (
          <Message
            key={index}
            message={message}
            id={id}
            groupChat={groupChat}
          />
        ))}
      </div>
    </Scrollbars>
  );
};

ScrollableChat.propTypes = {
  messages: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  groupChat: PropTypes.bool.isRequired,
};

export default ScrollableChat;

Message.propTypes = {
  message: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  groupChat: PropTypes.bool.isRequired,
};
