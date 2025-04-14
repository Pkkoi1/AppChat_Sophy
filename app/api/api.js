import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DATABASE_API, MY_IP } from "@env";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const API = `http://${MY_IP}:3000/api` || DATABASE_API;
// const API = `http://192.168.1.240:3000/api` || DATABASE_API;

let isRefreshing = false;
let failedQueue = [];

const http = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Thêm interceptor để tự động thêm token vào header
http.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Lỗi khi lấy token từ AsyncStorage:", error);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshaccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const refreshaccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.log("No refreshToken found in AsyncStorage.");
      throw new Error("Refresh token not found.");
    }

    console.log("Refreshing token with:", refreshToken);

    const response = await http.patch("/auth/refresh", undefined, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    console.log("Response from /auth/refresh:", response.data);

    const { accessToken, refreshToken: newRefreshToken } = response.data.token;
    if (!accessToken) {
      console.log("No accessToken returned from API.");
      throw new Error("No accessToken returned from API.");
    }

    await AsyncStorage.setItem("accessToken", accessToken);
    console.log("accessToken saved:", accessToken);

    await AsyncStorage.setItem("refreshToken", newRefreshToken);
    console.log("refreshToken saved:", newRefreshToken);

    if (response.data.user) {
      await AsyncStorage.setItem(
        "userInfo",
        JSON.stringify(response.data.user)
      );
      console.log("userInfo saved:", response.data.user);
    }

    console.log("Token refreshed successfully.");
    return accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userInfo"]);
    throw new Error("Session expired. Please log in again.");
  }
};
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
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
        await AsyncStorage.setItem(
          "userInfo",

          JSON.stringify(response.data.user)
        );
      }

      return response;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.message);
      console.error(
        "Chi tiết lỗi đăng nhập:",
        error.response?.data || error.message
      );
      console.error("Chi tiết lỗi đăng nhập 2:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          throw new Error("Lỗi mạng: Không thể kết nối đến máy chủ.");
        } else if (error.response) {
          throw new Error(
            `Lỗi ${error.response.status}: ${
              error.response.data.message || "Yêu cầu không thành công"
            }`
          );
        } else {
          throw new Error(`Lỗi không xác định: ${error.message}`);
        }
      } else {
        throw error;
      }
    }
  },
  refreshToken: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Không tìm thấy refreshToken. Yêu cầu đăng nhập lại.");
      }

      const response = await http.patch(
        "/auth/refresh",
        undefined, // Không gửi body
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const { accessToken, refreshToken: newRefreshToken } =
        response.data.token;
      if (!accessToken) {
        throw new Error("API không trả về accessToken mới.");
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem("refreshToken", newRefreshToken);
      }

      // Cập nhật userInfo nếu có
      if (response.data.user) {
        await AsyncStorage.setItem(
          "userInfo",
          JSON.stringify(response.data.user)
        );
      }

      return accessToken;
    } catch (error) {
      console.error("Lỗi khi làm mới token 2:", error.message);
      throw error;
    }
  },
  conversations: async () => {
    return await http.get(`/conversations`);
  },
  //Lấy thông tin cuộc trò chuyện theo ID
  getConversationById: async (conversationId) => {
    return await http.get(`/conversations/${conversationId}`);
  },

  getConversationDetails: async (conversationId) => {
    return await http.get(`/conversations/${conversationId}`);
  },
  getMessages: async (
    conversationId,
    lastMessageTime = null,
    direction = "before",
    limit = 20
  ) => {
    try {
      const query = { conversationId };

      // Handle both directions of message loading
      if (lastMessageTime) {
        query.createdAt =
          direction === "before"
            ? { $lt: new Date(lastMessageTime).toISOString() }
            : { $gt: new Date(lastMessageTime).toISOString() };
      }

      const response = await http.get(`/messages/${conversationId}`, {
        params: {
          lastMessageTime,
          direction,
          limit,
        },
      });

      const { messages, nextCursor, hasMore } = response.data;

      return {
        messages: direction === "before" ? messages : messages.reverse(),
        nextCursor,
        hasMore,
        direction,
      };
    } catch (error) {
      console.error("Error fetching messages:", error.message);
      throw error;
    }
  },
  getUserById: async (userId) => {
    return await http.get(`/users/get-user-by-id/${userId}`);
  },
  registerAccount: async (params) => {
    try {
      const response = await http.post("/auth/register", params);
      console.log("Phản hồi từ API Đăng ký:", response.data);

      if (response && response.data) {
        const { accessToken, refreshToken } = response.data.token; // Lấy token từ phản hồi

        if (!accessToken || !refreshToken) {
          throw new Error("API không trả về accessToken hoặc refreshToken");
        }

        // Lưu accessToken và refreshToken vào AsyncStorage
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
        await AsyncStorage.setItem(
          "userInfo",
          JSON.stringify(response.data.user)
        );
      }

      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      console.error("Lỗi khi đăng ký tài khoản:", error.message);
      throw error;
    }
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
        };
      }

      // Trả về lỗi custom nếu không đúng format
      throw new Error("Phản hồi từ API không hợp lệ.");
    } catch (error) {
      // Ghi log chi tiết
      console.error("Lỗi khi kiểm tra số điện thoại:", error?.message);
      console.error("Chi tiết lỗi:", error?.response?.data || error);

      // Nếu là lỗi từ Axios, giữ nguyên để xử lý ở ngoài
      if (error.response) {
        throw error;
      }

      // Ngược lại, ném lỗi bình thường
      throw new Error("Lỗi không xác định khi kiểm tra số điện thoại.");
    }
  },
  logout: async () => {
    try {
      // Gọi API logout nếu cần
      const response = await http.post("/auth/logout");
      console.log("Đăng xuất thành công:", response.data);
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error.message);
    } finally {
      // Xóa token khỏi AsyncStorage
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("userInfo");
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
  uploadImage: async (imageBase64) => {
    try {
      const response = await http.put("/users/mobile/update-avatar", {
        imageBase64, // Gửi ảnh dưới dạng base64
      });
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      console.error(
        "Lỗi khi tải ảnh lên:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy accessToken. Yêu cầu đăng nhập lại.");
      }

      const response = await http.put(
        "/auth/change-password",
        {
          userId, // Truyền userId vào body
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) {
        let errorMessage = "Yêu cầu không thành công"; // Default error message
        if (response.status === 400) {
          errorMessage =
            response.data?.message || "Mật khẩu hiện tại không đúng.";
        } else if (response.status === 401) {
          errorMessage =
            response.data?.message || "Không có quyền thực hiện hành động này.";
        } else if (response.status === 404) {
          errorMessage = response.data?.message || "Không tìm thấy người dùng.";
        } else {
          errorMessage = `Lỗiiii ${response.status}: ${
            response.data?.message || "Yêu cầu không thành công"
          }`;
        }
        throw new Error(errorMessage);
      }

      // Nếu backend trả về token mới, lưu lại
      const { accessToken, refreshToken } = response.data.token || {};
      if (accessToken && refreshToken) {
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      return { message: "Password changed successfully", data: response.data };
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error.message);
      throw error;
    }
  },

  verifyQrToken: async (qrToken) => {
    try {
      const response = await http.post("/auth/verify-qr-token", {
        qrToken: qrToken,
      });
      if (response.status === 200) {
        return {
          message: "QR token verified successfully",
          data: response.data,
        };
      } else {
        throw new Error(
          `Lỗi ${response.status}: ${
            response.data?.message || "Yêu cầu không thành công"
          }`
        );
      }
    } catch (error) {
      console.error("Lỗi khi xác minh QR token:", error.message);
      throw error;
    }
  },

  confirmQrLogin: async (qrToken) => {
    try {
      const response = await http.post("/auth/confirm-qr-login", {
        qrToken: qrToken,
      });
      if (response.status === 200) {
        return {
          message: "QR login confirmed successfully",
          data: response.data,
        };
      } else {
        throw new Error(
          `Lỗi ${response.status}: ${
            response.data?.message || "Yêu cầu không thành công"
          }`
        );
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận QR login:", error.message);
      throw error;
    }
  },
  sendMessage: async ({ conversationId, content }) => {
    try {
      const response = await http.post("/messages/send", {
        conversationId,
        content,
      });

      if (response.status === 201) {
        return response.data; // Return the created message data
      } else {
        throw new Error(
          `Lỗi ${response.status}: ${
            response.data?.message || "Yêu cầu không thành công"
          }`
        );
      }
    } catch (error) {
      console.error(
        "Lỗi khi gửi tin nhắn:",
        error.response?.data || error.message
      );

      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            `Lỗi ${error.response.status}: ${
              error.response.data?.message || "Yêu cầu không thành công"
            }`
          );
        } else if (error.code === "ERR_NETWORK") {
          throw new Error("Lỗi mạng: Không thể kết nối đến máy chủ.");
        }
      }

      throw new Error("Lỗi không xác định khi gửi tin nhắn.");
    }
  },
};
