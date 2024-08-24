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
      state.chats = action.payload;
      // console.log("Updated state:", JSON.stringify(state.chats, null, 2));
    },
    addChat: (state, action) => {
      // console.log("Previous state:", JSON.stringify(state.chats, null, 2));
      // console.log("Action payload:", JSON.stringify(action.payload, null, 2));
      state.chats = [...state.chats, action.payload];
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

    updateLastMessage: (state, action) => {
      // console.log("Action Payload:", JSON.stringify(action.payload, null, 2));
      // console.log("Initial State:", JSON.stringify(state.chats, null, 2));

      const { chatId, newLastMessage } = action.payload;

      // Find the index of the chat that needs updating
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      // console.log("Chat Index Found:", chatIndex);

      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];
        // console.log("Chat Before Update:", JSON.stringify(chat, null, 2));

        // Create the updated lastMessage object
        const updatedLastMessage = {
          ...newLastMessage,
          sender: newLastMessage.sender._id,
          ...chat.participants.find(
            (participant) => participant._id === newLastMessage.sender
          ),
        };
        // console.log(
        //   "Updated Last Message:",
        //   JSON.stringify(updatedLastMessage, null, 2)
        // );

        // Update the chat's lastMessage field
        state.chats[chatIndex] = {
          ...chat,
          lastMessage: [updatedLastMessage],
        };

        // console.log(
        //   "Chat After Update:",
        //   JSON.stringify(state.chats[chatIndex], null, 2)
        // );
      } else {
        console.warn(`Chat with ID ${chatId} not found.`);
      }

      // console.log("Final State:", JSON.stringify(state.chats, null, 2));
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
} = chatSlice.actions;

export default chatSlice.reducer;
