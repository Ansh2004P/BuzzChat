import React, { Suspense } from "react";
import ChatIcon from "../../utils/icons/ChatIcon";
import useChatState from "../../hooks/useChatState";
import Loader from "../Loader";
import ErrorBoundary from "../ErrorBoundary";

// Lazy load SingleChat for better performance
const SingleChat = React.lazy(() => import("./SingleChatOptimized"));

const ChatWindow = React.memo(() => {
  const { selectedChat } = useChatState();

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

  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex items-center justify-center">
            <Loader />
          </div>
        }
      >
        <SingleChat />
      </Suspense>
    </ErrorBoundary>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;
