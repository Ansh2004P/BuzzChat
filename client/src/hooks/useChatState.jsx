// src/hooks/useChatState.js
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedChat,
  setNotification,
  setChats,
  addChat,
  removeChat,
  setSearchResult,
} from "../utils/redux/chatSlice";

const useChatState = () => {
  const dispatch = useDispatch();
  const chatState = useSelector((state) => state.chat);

  return {
    ...chatState,
    setSelectedChat: (chat) => dispatch(setSelectedChat(chat)),
    setNotification: (notification) => dispatch(setNotification(notification)),
    setChats: (chats) => dispatch(setChats(chats)),
    addChat: (data) => {
      // console.log(data);
      dispatch(addChat(data));
    },
    removeChat: (chatId) => dispatch(removeChat(chatId)),
    setSearchResult: (searchResult) => dispatch(setSearchResult(searchResult)),
  };
};

export default useChatState;
