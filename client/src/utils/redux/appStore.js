import { configureStore } from "@reduxjs/toolkit";
import useReducer from "./userSlice";
import chatReducer from "./chatSlice";
import groupSearchReducer from "./groupSearchSlice";

const appStore = configureStore({
  reducer: {
    user: useReducer,
    chat: chatReducer,
    groupSearch: groupSearchReducer,
  },
});

export default appStore;
