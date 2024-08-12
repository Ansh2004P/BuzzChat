import React, { useEffect } from "react";
import { CrossButton } from "../userProfile/CrossButton";
import PropTypes from "prop-types";
import ChatInfo from "./ChatInfo";
import useChatState from "../../hooks/useChatState";

const ChatModal = ({ onclose }) => {
  const { selectedChat } = useChatState();
  const [zoom, setZoom] = React.useState(false);

  const mid = selectedChat.user;
  const user = { ...mid };
  // console.log(user[0].username);
  // console.log(user[0].avatar);

  const handleClose = () => {
    if (onclose) {
      onclose(); // Call the onClose callback function if provided
    }
  };

  const handleZoom = () => {
    setZoom(!zoom);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 h-screen w-screen">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>

      {/* Modal Content */}
      {zoom && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 h-screen w-screen"
          onClick={handleZoom}
        >
          <img
            src={user[0].avatar}
            alt="avatar"
            className="rounded-full w-[70vw] h-[70vh] object-cover"
          />
        </div>
      )}

      {/* Modal */}
      <div className="bg-neutral-700 text-white p-4 rounded-md relative w-fit max-w-2xl h-auto max-h-[100vh] overflow-y-auto">
        <CrossButton
          className="absolute top-4 right-4 p-2"
          onClick={handleClose}
        />
        <div className="mx-4 flex w-fit cursor:pointer">
          <div className="rounded-full mt-2 w-[140px] h-[140px]">
            <img
              src={user[0].avatar}
              alt="avatar"
              className="rounded-full w-full h-full object-cover p-2"
            />
            <div
              onClick={handleZoom}
              className="absolute inset-0 w-[124px] h-[124px] my-[6.2%] mx-[7.5%] p-4 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-100 bg-black bg-opacity-50 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
            </div>
          </div>
          <span className="h-20vh w-[60%] text-white text-lg font-thin p-4 m-6">
            <b>Username: </b> {" " + user[0].username}
            <br />
            <b>Email: </b> {" " + user[0].email}
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
