import Heading from "./Heading";
import SearchBar from "../SearchBar";
import useFetchChat from "../../hooks/useFetchChats";
import { useState } from "react";
import ChatList from "./ChatList";

const MyChats = () => {
  const [searchResult, setSearchResult] = useState([]);
  const { chats } = useFetchChat();

  return (
    <div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-2 ml-4 text-white flex flex-col ">
      <Heading />
      <SearchBar onSearchResult={setSearchResult} />

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
