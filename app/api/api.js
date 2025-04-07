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
      console.error(
        "Chi tiết lỗi đăng nhập:",
        error.response?.data || error.message
      );
      console.error("Chi tiết lỗi đăng nhập 2:", error);

      throw error;
    }
  },
  refreshToken: async () => {
    try {
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
      const newAccessToken = response.data.accessToken;
      if (!newAccessToken) {
        throw new Error("API không trả về accessToken mới.");
      }

      await AsyncStorage.setItem("authToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Lỗi khi làm mới token:", error.message);
      throw error;
    }
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
  //Check số dien thoại đã tồn tại hay chưa
  checkPhone: async (phone) => {
    try {
      const resp = await http.post(`/auth/check-used-phone/${phone}`);
      if (
        resp.status === 200 &&
        resp.data.message === "Verification code generated."
      ) {
        return {
          otpId: resp.data.otpId,
          otp: resp.data.otp,
          message: resp.data.message,
        }; // Trả về dữ liệu nếu thành công
      }
      throw new Error("Phản hồi từ API không hợp lệ.");
    } catch (error) {
      console.error("Lỗi khi kiểm tra số điện thoại:", error.message);
      console.error(
        "Chi tiết lỗi khi kiểm tra số điện thoại:",
        error.response?.data || error.message
      );
      throw new Error(
        "Lỗi khi kiểm tra số điện thoại tại api: " +
          (error.response?.statusText || error.message)
      );
    }
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
  verifyPhoneOTP: async (phone, otp, otpId) => {
    try {
      const response = await http.post("/auth/verify-otp", {
        phone,
        otp,
        otpId,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xác minh OTP:", error.message);
      throw error;
    }
  },
  sendOtpForgotPassword: async (phone) => {
    try {
      const response = await http.post("/auth/send-otp-forgot-password", {
        phone,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gửi OTP quên mật khẩu:", error.message);
      throw error;
    }
  },
  verifyOTPForgotPassword: async (phone, otp, otpId) => {
    try {
      const response = await http.post("/auth/verify-otp-forgot-password", {
        phone,
        otp,
        otpId,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xác minh OTP:", error.message);
      throw error;
    }
  },
  resetPassword: async (phone, newPassword) => {
    try {
      const response = await http.put("/auth/forgot-password", {
        phone,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error.message);
      throw error;
    }
  },
  // /update-user/info
  updateUser: async (userId, params) => {
    try {
      const response = await http.put(`/users/mobile/update-info`, {
        userId,
        ...params, // Truyền các trường cần cập nhật từ params
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật thông tin người dùng:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
