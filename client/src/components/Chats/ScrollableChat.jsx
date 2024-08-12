import React from "react";
import Scrollbars from "react-custom-scrollbars";
import PropTypes from "prop-types";

const ScrollableChat = ({ messages }) => {
  return (
    <Scrollbars autoHide>
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.sender === "user" ? "flex-row-reverse" : "flex-row"
            } flex w-full justify-between`}
          >
            <div
              className={`${
                message.sender === "user"
                  ? "bg-emerald-700 text-white"
                  : "bg-neutral-700 text-white"
              } p-2 px-4 rounded-lg my-2`}
            >
              {message.message}
            </div>
          </div>
        ))}
      </div>
    </Scrollbars>
  );
};

ScrollableChat.propTypes = {
  messages: PropTypes.array.isRequired,
};

export default ScrollableChat;
