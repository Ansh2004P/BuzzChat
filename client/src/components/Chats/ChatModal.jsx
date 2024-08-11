import React, { useEffect } from "react";
import { CrossButton } from "../userProfile/CrossButton";
import PropTypes from "prop-types";
import ChatInfo from "./ChatInfo";
import useChatState from "../../hooks/useChatState";

const ChatModal = ({ onclose }) => {
  const { selectedChat } = useChatState();
  const handleClose = () => {
    if (onclose) {
      onclose(); // Call the onClose callback function if provided
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 h-screen w-screen">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div className="bg-neutral-700 text-white p-4 rounded-md relative w-fit max-w-2xl h-auto max-h-[100vh] overflow-y-auto">
        <CrossButton
          className="absolute top-4 right-4 p-2"
          onClick={handleClose}
        />
        <div className="mx-4 flex w-fit ">
          <ChatInfo avatar={selectedChat.avatar} wsize="10vw" hsize="20vh" />
          <span className="h-20vh w-[60%] text-white text-lg font-thin p-4 m-6">
            <b>Username: </b> {" " + selectedChat.username}
            <br />
            <b>Email: </b> {" " + selectedChat.email}
          </span>
        </div>
      </div>
    </div>
  );
};

ChatModal.propTypes = {
  onclose: PropTypes.func,
};

export default ChatModal;
