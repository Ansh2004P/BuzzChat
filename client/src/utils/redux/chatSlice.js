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
      state.chats = action.payload;
    },
    addChat: (state, action) => {
      state.chats = [...state.chats, action.payload];
    },
    removeChat: (state, action) => {
      console.log(action.payload);
      console.log("chats", state.chats);
      // Remove the chat with the matching _id
      state.chats = state.chats.filter((chat) => chat._id !== action.payload);
    },
    setSearchResult: (state, action) => {
      state.searchResult = action.payload; // Add searchResult reducer
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
} = chatSlice.actions;

export default chatSlice.reducer;
