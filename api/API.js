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
    }
  } catch (error) {
    console.error("Lỗi khi lấy token từ AsyncStorage:", error);
  }
  return config;
});

// Thêm interceptor để xử lý lỗi 401 và làm mới token
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi là 401 và chưa thử refresh token
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Lấy refreshToken từ AsyncStorage
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error(
            "Không tìm thấy refreshToken. Yêu cầu đăng nhập lại."
          );
        }

        // Gọi API làm mới token
        const response = await axios.post(`${API}/auth/refresh`, null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        // Lưu accessToken mới vào AsyncStorage
        const newAccessToken = response.data.accessToken;
        await AsyncStorage.setItem("authToken", newAccessToken);

        // Cập nhật header Authorization và gửi lại request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        console.error("Lỗi khi làm mới token:", refreshError);
        // Nếu refreshToken hết hạn, yêu cầu đăng nhập lại
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("refreshToken");
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  login: async (params) => {
    try {
      const response = await http.post("/auth/login", params);
      console.log("Phản hồi từ API login:", response.data);

      if (response && response.data) {
        const { accessToken, refreshToken } = response.data.token; // Truy cập từ response.data.token

        if (!accessToken || !refreshToken) {
          throw new Error("API không trả về accessToken hoặc refreshToken");
        }

        // Lưu accessToken và refreshToken vào AsyncStorage
        await AsyncStorage.setItem("authToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      return response;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.message);
      throw error;
    }
  },
  refreshToken: async () => {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("Không tìm thấy refreshToken. Yêu cầu đăng nhập lại.");
    }

    const response = await http.post("/auth/refresh", null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    // Lưu accessToken mới vào AsyncStorage
    await AsyncStorage.setItem("authToken", response.data.accessToken);
    return response.data.accessToken;
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
  getUserById: async (userId) => {
    return await http.get(`/users/get-user-by-id/${userId}`);
  },
  registerAccount: async (params) => {
    return await http.post("/auth/register", params);
  },
  logout: async () => {
    try {
      const response = await http.post("/auth/logout");
      console.log("Đăng xuất thành công:", response.data);

      // Xóa token khỏi AsyncStorage
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    }
  },
};
