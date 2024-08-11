import React from "react";
import ChatIcon from "../../utils/icons/ChatIcon";
import useChatState from "../../hooks/useChatState";
import UserAvatar from "../userProfile/UserAvatar";
import VoiceCall from "./VoiceCall";
import VideoCall from "./VideoCall";
import ChatInfo from "./ChatInfo";
import Modal from "../Modal";
import ChatModal from "./ChatModal";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";

const ChatWindow = () => {
  const { selectedChat } = useChatState();
  const [showProfile, setShowProfile] = React.useState(false);
  //   console.log(selectedChat);

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  if (!selectedChat) {
    return (
      <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center w-full h-full text-white p-6 rounded-lg">
          <ChatIcon />
          <span className="text-2xl text-neutral-600 md:text-3xl font-semibold text-center">
            No Chat Selected
          </span>
          <p className="mt-4 text-lg text-center text-neutral-600">
            Please select a chat from the list or start a new conversation to
            begin chatting.
          </p>
        </div>
      </div>
    );
  }
  console.log(showProfile);

  return (
    <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex flex-col">
      <div className="bg-emerald-700 w-full h-fit rounded-t-2xl  flex justify-between">
        <span className="text-white font-semibold font-sans text-2xl p-6 ml-8">
          {selectedChat.username}
        </span>
        <div className="flex w-fit space-x-2 mr-4 p-2">
          <VoiceCall />
          <VideoCall />
          <div onClick={handleShowProfile}>
            <ChatInfo
              avatar={selectedChat.avatar}
              wsize={"50px"}
              hsize={"50px"}
            />
          </div>
        </div>
        {showProfile && <ChatModal onclose={() => setShowProfile(false)} />}
      </div>
      <div className="bg-neutral-800 h-[78%] w-full p-4">
        <span>body</span>
      </div>
      <div className="h-[8%] rounded-b-2xl bg-stone-700 flex pl-2">
        <button className="ml-4 hover:bg-stone-600 rounded-full w-10 h-10 items-center mt-1">
          <PaperClipIcon className="h-5 w-5 text-white m-2 " />
        </button>
        <input
          className="ml-3 px-3  w-[89%] h-full bg-stone-700 focus:outline-none placeholder:text-gray-500 text-white"
          placeholder="Type a message"
          type="text"
        />
        <button className="w-[7%] h-11 bg-emerald-700 rounded-br-2xl hover:bg-emerald-600">
          <ArrowRightIcon className="w-6 h-6 text-white mx-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
