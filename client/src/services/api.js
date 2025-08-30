import axios from "axios";
import { LocalStorage } from "../utils/utils";

// Create an axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve user token from local storage
    const token = LocalStorage.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors globally
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      LocalStorage.remove("token");
      window.location.href = "/login";
    }
    
    if (error.response?.status >= 500) {
      // Server error - show generic message
      console.error("Server error:", error);
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  login: (data) => apiClient.post("/user/login", data),
  register: (data) => apiClient.post("/user/register", data),
  logout: () => apiClient.post("/user/logout"),
  getCurrentUser: () => apiClient.get("/user/me"),
};

export const userAPI = {
  getAvailableUsers: () => apiClient.get("/user/get-users"),
  searchUsers: (query) => 
    apiClient.get("/chat/search-user", { params: { search: query } }),
  updateProfile: (data) => apiClient.put("/user/profile", data),
};

export const chatAPI = {
  getUserChats: () => apiClient.get("/chat/"),
  createUserChat: (userId) => apiClient.post("/chat/", { userId }),
  createGroupChat: (data) => apiClient.post("/chat/group", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  renameGroup: (chatId, chatName) => apiClient.put("/chat/rename", { chatId, chatName }),
  leaveGroup: (chatId) => apiClient.put("/chat/leaveGroup", { chatId }),
  removeParticipant: (userId, chatId) => apiClient.put("/chat/groupRemove", { userId, chatId }),
  addParticipant: (userId, chatId) => apiClient.put("/chat/groupAdd", { userId, chatId }),
  updateGroupAvatar: (chatId, formData) => apiClient.put("/chat/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getChatMessages: (chatId) => apiClient.get(`/message/${chatId}`, {
    params: { chatId }
  }),
};

export const messageAPI = {
  sendMessage: (chatId, formData) => 
    apiClient.post(`/message/${chatId}`, formData, {
      params: { chatId },
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMessages: (chatId) => 
    apiClient.get(`/message/${chatId}`, { params: { chatId } }),
};

export default apiClient;
