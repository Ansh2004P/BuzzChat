// ChatPage.js
import React, { Suspense } from "react";
import Loader from "../components/Loader";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

// Lazy load components for better performance
const ChatWindow = React.lazy(() => import("../components/Chats/ChatWindow"));
const MyChats = React.lazy(() => import("../components/Chats/MyChats"));
const Heading = React.lazy(() => import("../components/Heading"));

const ChatPage = () => {
  const { user, isLoading } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-screen h-screen bg-black bg-opacity-90">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center w-screen h-screen bg-black bg-opacity-90">
        <div className="text-white text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-black bg-opacity-90">
      <Suspense fallback={<div className="h-16 bg-emerald-700" />}>
        <Heading user={user} />
      </Suspense>
      <div className="flex justify-between w-full h-[82%]">
        <Suspense fallback={<div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-2 ml-4" />}>
          <MyChats currUserId={user._id} />
        </Suspense>
        <Suspense fallback={<div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%]" />}>
          <ChatWindow />
        </Suspense>
      </div>
    </div>
  );
};

export default ChatPage;
