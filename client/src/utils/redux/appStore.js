import { configureStore } from "@reduxjs/toolkit";
import useReducer from "./userSlice";
import chatReducer from "./chatSlice";

const appStore = configureStore({
  reducer: {
    user: useReducer,
    chat: chatReducer,
  },
});

export default appStore;
