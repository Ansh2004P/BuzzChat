// src/redux/slices/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChat: null,
  notification: [],
  chats: [],
  searchResult: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },

    setNotification: (state, action) => {
      state.notification = action.payload;
    },
    setChats: (state, action) => {
      // console.log("Previous state:", JSON.stringify(state.chats, null, 2));
      // console.log("Action payload:", JSON.stringify(action.payload, null, 2));
      // console.log("Previous state:", JSON.stringify(state.chats, null, 2));
      // console.log("Action payload:", JSON.stringify(action.payload, null, 2));
      state.chats = action.payload;
      // console.log("Updated state:", JSON.stringify(state.chats, null, 2));
      // console.log("Updated state:", JSON.stringify(state.chats, null, 2));
    },
    addChat: (state, action) => {
      // console.log("Previous state:", JSON.stringify(state.chats, null, 2));
      // console.log("Action payload:", JSON.stringify(action.payload, null, 2));
      // console.log("Previous state:", JSON.stringify(state.chats, null, 2));
      // console.log("Action payload:", JSON.stringify(action.payload, null, 2));
      state.chats = [...state.chats, action.payload];
      // console.log("Updated state:", JSON.stringify(state.chats, null, 2));
      // console.log("Updated state:", JSON.stringify(state.chats, null, 2));
    },


    removeChat: (state, action) => {
      console.log(action.payload);
      console.log("chats", state.chats);
      // Remove the chat with the matching _id
      state.chats = state.chats.filter((chat) => chat._id !== action.payload);
    },

    setSearchResult: (state, action) => {
      state.searchResult = action.payload;
    },

    updateLastMessage(state, action) {
      // console.log("Action received:", JSON.stringify(action, null, 2)); // Pretty-print the action

      const { chatId, newLastMessage } = action.payload;
      // console.log(
      // `Updating last message for chatId: ${chatId}`,
      // newLastMessage
      // );

      const chatIndex = state.chats.findIndex((chat) =>
        chat.isGroupChat ? chat._id === chatId : chat.chatId === chatId
      );

      if (chatIndex !== -1) {
        // console.log(`Chat found at index ${chatIndex}`, state.chats[chatIndex]);
        const updatedLastMessage = Array.isArray(newLastMessage)
          ? newLastMessage
          : [newLastMessage];

        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          lastMessage: updatedLastMessage, // Assuming `lastMessage` should not be an array
        };
        state.searchResult[chatIndex] = {
          ...state.searchResult[chatIndex],
          lastMessage: updatedLastMessage,
        };

        // console.log(`Updated chat`, state.chats[chatIndex]);
      } else {
        console.warn(`Chat with ID ${chatId} not found.`);
      }
    },
  },
});

export const {
  setSelectedChat,
  setNotification,
  setChats,
  addChat,
  removeChat,
  setSearchResult,
  updateLastMessage,
  updateLastMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
