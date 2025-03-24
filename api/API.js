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
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token được thêm vào header:", token);
    } else {
      console.warn("Không tìm thấy token trong AsyncStorage.");
    }
  } catch (error) {
    console.error("Lỗi khi lấy token từ AsyncStorage:", error);
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
  //Lấy user theo id
  getUserById: async (userId) => {
    return await http.get(`/users/get-user-by-id/${userId}`);
  },
  logout: async () => {
    try {
      // Gửi yêu cầu logout đến server trước khi xóa token
      const response = await http.post("/auth/logout");
      console.log("Đăng xuất thành công:", response.data);

      // Xóa token khỏi AsyncStorage sau khi logout thành công
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      if (error.response) {
        // Lỗi từ phía server
        console.error("Lỗi từ server:", error.response.data);
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error("Không nhận được phản hồi từ server:", error.request);
      } else {
        // Lỗi khác
        console.error("Lỗi khi gọi API logout:", error.message);
      }
    }
  },
};
