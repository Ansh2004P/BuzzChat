import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import useReducer from "./userSlice";
import chatReducer from "./chatSlice";
import groupSearchReducer from "./groupSearchSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  user: useReducer,
  chat: chatReducer,
  groupSearch: groupSearchReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const appStore = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(appStore);
export default appStore;
