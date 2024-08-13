import React, { useRef, useEffect } from "react";
import Scrollbars from "react-custom-scrollbars";
import PropTypes from "prop-types";

const ScrollableChat = ({ messages, id }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (scrollRef.current) {
      scrollRef.current.scrollToBottom();
    }
  }, [messages]);

  return (
    <Scrollbars autoHide ref={scrollRef}>
      <div>
        {messages
          .slice()
          .reverse()
          .map((message, index) => (
            <div
              key={index}
              className={`${
                message._id === `${id}` ? "flex-row-reverse" : "flex-row"
              } flex w-fit justify-between h-fit max-w-lg`}
            >
              <div
                className={`relative mx-2 ${
                  message._id === `${id}`
                    ? "bg-emerald-700 text-white rounded-r-lg"
                    : "bg-neutral-700 text-white rounded-b-lg rounded-t-lg"
                } p-2 px-4 my-2`}
              >
                {message.content}
                {message._id !== `${id}` ? (
                  <>
                    <div className="absolute top-0 left-0 w-4 h-4 bg-neutral-700 rounded-bl-lg transform -translate-x-2 -translate-y-3/2"></div>
                    <div className="absolute top-0 left-0 w-4 h-4 bg-neutral-800 rounded-tr-lg transform -translate-x-4 -translate-y-3/2"></div>
                  </>
                ) : (
                  <>
                    <div className="absolute top-0 left-0 w-4 h-4 bg-neutral-700 rounded-br-lg transform -translate-x-2 -translate-y-3/2"></div>
                    <div className="absolute top-0 left-0 w-4 h-4 bg-neutral-800 rounded-tl-lg transform -translate-x-4 -translate-y-3/2"></div>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
    </Scrollbars>
  );
};

ScrollableChat.propTypes = {
  messages: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
};

export default ScrollableChat;
