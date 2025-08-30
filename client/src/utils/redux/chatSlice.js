// src/redux/slices/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChat: null,
  notification: [],
  chats: [],
  searchResult: [],
  isSearching: false,
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
    addChat: (state, action) => {
      state.chats.push(action.payload);
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

    setSearching: (state, action) => {
      state.isSearching = action.payload;
    },

    setChats: (state, action) => {
      state.chats = action.payload;
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

    updateChatParticipants(state, action) {
      const { chatId, participants } = action.payload;
      
      // Update selected chat if it matches
      if (state.selectedChat && state.selectedChat._id === chatId) {
        state.selectedChat = {
          ...state.selectedChat,
          participants: participants,
          users: participants, // Keep both for compatibility
        };
      }

      // Update chat in chats array
      const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          participants: participants,
          users: participants,
        };
      }
    },

    removeChatParticipant(state, action) {
      const { chatId, userId } = action.payload;
      
      // Update selected chat if it matches
      if (state.selectedChat && state.selectedChat._id === chatId) {
        const currentParticipants = state.selectedChat.participants || state.selectedChat.users || [];
        const filteredParticipants = currentParticipants.filter(user => user._id !== userId);
        
        state.selectedChat = {
          ...state.selectedChat,
          participants: filteredParticipants,
          users: filteredParticipants,
        };
      }

      // Update chat in chats array
      const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
      if (chatIndex !== -1) {
        const currentParticipants = state.chats[chatIndex].participants || state.chats[chatIndex].users || [];
        const filteredParticipants = currentParticipants.filter(user => user._id !== userId);
        
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          participants: filteredParticipants,
          users: filteredParticipants,
        };
      }
    },

    addChatParticipant(state, action) {
      const { chatId, user } = action.payload;
      
      // Update selected chat if it matches
      if (state.selectedChat && state.selectedChat._id === chatId) {
        const currentParticipants = state.selectedChat.participants || state.selectedChat.users || [];
        const updatedParticipants = [...currentParticipants, user];
        
        state.selectedChat = {
          ...state.selectedChat,
          participants: updatedParticipants,
          users: updatedParticipants,
        };
      }

      // Update chat in chats array
      const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
      if (chatIndex !== -1) {
        const currentParticipants = state.chats[chatIndex].participants || state.chats[chatIndex].users || [];
        const updatedParticipants = [...currentParticipants, user];
        
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          participants: updatedParticipants,
          users: updatedParticipants,
        };
      }
    },

    updateChatName(state, action) {
      const { chatId, chatName } = action.payload;
      
      // Update selected chat if it matches
      if (state.selectedChat && state.selectedChat._id === chatId) {
        state.selectedChat = {
          ...state.selectedChat,
          chatName: chatName,
        };
      }

      // Update chat in chats array
      const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          chatName: chatName,
        };
      }
    },

    updateChatAvatar(state, action) {
      const { chatId, avatar } = action.payload;
      
      // Update selected chat if it matches
      if (state.selectedChat && state.selectedChat._id === chatId) {
        state.selectedChat = {
          ...state.selectedChat,
          avatar: avatar,
        };
      }

      // Update chat in chats array
      const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          avatar: avatar,
        };
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
  setSearching,
  updateLastMessage,
  updateChatParticipants,
  removeChatParticipant,
  addChatParticipant,
  updateChatName,
  updateChatAvatar,
} = chatSlice.actions;

export default chatSlice.reducer;
