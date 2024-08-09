import axios from "axios";
import { LocalStorage } from "./utils";

// Create an axios instance for API request
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});

// Intercept requests before they are sent
apiClient.interceptors.request.use(
  function (config) {
    // Retrieve user token from local storage
    const token = LocalStorage.get("token");
    // Set authorization header with bearer token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Handle the error
    return Promise.reject(error);
  }
);

const loginUser = (data) => {
  return apiClient.post("/user/login", data, {
    headers: { "Content-Type": "application/json" },
  });
};

const registerUser = async (data) => {
  return await apiClient.post("/user/register", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const logoutUser = () => {
  return apiClient.post("/user/logout");
};

const getAvailableUsers = () => {
  return apiClient.get("/user/get-users");
};

const getUserChats = () => {
  return apiClient.get(`/chat/`);
};

const createUserChat = (receiverId) => {
  return apiClient.post(`/chat/`, { receiverId });
};

const createGroupChat = (data) => {
  return apiClient.post("/chat/group", { data });
};

const renameGroup = (data) => {
  return apiClient.put("/chat/rename", { data });
};

const leaveGroup = (chatId) => {
  return apiClient.put(`/chat/leaveGroup/${chatId}`);
};

export {
  loginUser,
  registerUser,
  logoutUser,
  getAvailableUsers,
  getUserChats,
  createUserChat,
  createGroupChat,
  renameGroup,
  leaveGroup,
};
