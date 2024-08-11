// src/redux/slices/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChat: null,
  notification: [],
  chats: [],
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
      // Append the new chat to the state array
      state.push(action.payload);
    },
    removeChat: (state, payload) => {
      state.chats = state.chats.filter((chat) => chat._id !== payload);
    },
  },
});

export const {
  setSelectedChat,
  setNotification,
  setChats,
  addChat,
  removeChat,
} = chatSlice.actions;

export default chatSlice.reducer;
