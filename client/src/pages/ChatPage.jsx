// ChatPage.js
import Loading from "../assets/images/Ellipsis@1x-1.8s-200px-200px";
import ChatWindow from "../components/Chats/ChatWindow";
import MyChats from "../components/Chats/MyChats";
import Heading from "../components/Heading";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

import { useState, useEffect } from "react";

const ChatPage = () => {
  const { user } = useGetCurrentUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-screen h-screen bg-black bg-opacity-90">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-black bg-opacity-90">
      <Heading user={user} />
      <div className="flex justify-between w-full h-[82%]">
        <MyChats currUserId={user._id} />
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
