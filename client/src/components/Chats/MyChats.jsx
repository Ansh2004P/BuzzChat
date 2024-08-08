import axios from "axios";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import ChatList from "./ChatList";
import useChatState from "../../hooks/useChatState";
import useFetchChat from "../../hooks/useFetchChats";
import useSearchUser from "../../hooks/useSearchUser";
import Heading from "./Heading";

const MyChats = () => {
  const searchUser = useRef("");
  const prevValue = useRef("");

  const { chats, loading } = useFetchChat();
  const { handleSearch, searchResult, setSearchResult } =
    useSearchUser(searchUser);

  const handleInputChange = (e) => {
    const currentValue = e.target.value;

    if (prevValue.current !== "" && currentValue === "") {
      setSearchResult([]);
    }
    prevValue.current = currentValue;
  };

  return (
    <div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-2 mx-4 text-white flex flex-col ">
      <Heading />
      <input
        ref={searchUser}
        type="search"
        className="mt-4 bg-neutral-600 border-neutral-500 rounded-lg border-2 p-1 text-white selection:border-white"
        placeholder=" Search user here to extend your chit-chat"
        onKeyDown={handleSearch}
        onInput={handleInputChange}
      ></input>
    
      <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700" />
      
      {searchResult.length === 0 ? (
        <ChatList chats={chats} />
      ) : (
        <ChatList chats={searchResult} />
      )}
    </div>
  );
};

export default MyChats;
