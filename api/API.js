import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DATABASE_API, MY_IP } from "@env";

const API = `http://${MY_IP}:3000/api` || DATABASE_API;

const http = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Thêm interceptor để tự động thêm token vào header
http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  login: async (params) => {
    const response = await http.post("/auth/login", params);
    if (response && response.data && response.data.token) {
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem("authToken", response.data.token);
    }
    return response;
  },
  conversations: async () => {
    return await http.get(`/conversations`);
  },
  getConversationDetails: async (conversationId) => {
    return await http.get(`/conversations/${conversationId}`);
  },
  getMessages: async (conversationId) => {
    return await http.get(`/messages/${conversationId}`);
  },
  logout: async () => {
    await AsyncStorage.removeItem("authToken");
  },
};
