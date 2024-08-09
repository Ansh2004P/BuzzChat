// ChatPage.js

import Loading from "../assets/images/Ellipsis@1x-1.8s-200px-200px";
import MyChats from "../components/Chats/MyChats";
import Heading from "../components/Heading";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import ChatIcon from "../utils/icons/ChatIcon";
import { useState, useEffect } from "react";

const ChatPage = () => {
  const { user } = useGetCurrentUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Wait for 2 seconds before setting isLoading to false
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-black bg-opacity-90 flex flex-col justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black bg-opacity-90 flex flex-col">
      <Heading user={user} />
      <div className="flex justify-between w-full h-[82%]">
        <MyChats />
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
      </div>
    </div>
  );
};

export default ChatPage;
