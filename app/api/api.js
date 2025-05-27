import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DATABASE_API, MY_IP } from "@env";

// Ưu tiên local nếu có MY_IP, nếu không thì fallback render
const API = DATABASE_API;

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

// Thêm interceptor để xử lý lỗi 401 và làm mới token
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error(
            "Không tìm thấy refreshToken. Yêu cầu đăng nhập lại."
          );
        }

        const response = await axios.patch(`${API}/auth/refresh`, undefined, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const newAccessToken = response.data.token.accessToken;
        const newRefreshToken = response.data.token.refreshToken;
        if (newRefreshToken) {
          await AsyncStorage.setItem("refreshToken", newRefreshToken);
        }
        console.log("Phản hồi từ API refreshToken:", response.data);
        await AsyncStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        console.error("Lỗi khi làm mới token:", refreshError);
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  // Auth APIs
  login: async (params) => {
    // Đăng nhập và lưu token vào AsyncStorage
    try {
      const response = await http.post("/auth/login", params);
      console.log("Phản hồi từ API login:", response.data);

      if (response && response.data) {
        const { accessToken, refreshToken } = response.data.token;

        if (!accessToken || !refreshToken) {
          throw new Error("API không trả về accessToken hoặc refreshToken");
        }

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
    // Làm mới token khi token cũ hết hạn
    try {
      const callRefreshToken = await AsyncStorage.getItem("refreshToken");
      if (!callRefreshToken) {
        throw new Error(
          "Không tìm thấy callRefreshToken. Yêu cầu đăng nhập lại."
        );
      }

      const response = await http.patch("/auth/refresh", undefined, {
        headers: {
          Authorization: `Bearer ${callRefreshToken}`,
        },
      });

      const { accessToken, refreshToken } = response.data.token;
      console.log("Phản hồi từ API refreshToken:", response.data);

      if (!accessToken) {
        throw new Error("API không trả về accessToken mới.");
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

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
  logout: async () => {
    // Đăng xuất và xóa token khỏi AsyncStorage
    try {
      const response = await http.post("/auth/logout");
      console.log("Đăng xuất thành công:", response.data);
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error.message);
    } finally {
      await AsyncStorage.removeItem("acc");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("userInfo");
    }
  },
  verifyPhoneOTP: async (phone, otp, otpId) => {
    // Xác minh OTP khi đăng ký hoặc đăng nhập
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
    // Gửi OTP để đặt lại mật khẩu
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
    // Xác minh OTP khi đặt lại mật khẩu
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
    // Đặt lại mật khẩu mới
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
  changePassword: async (userId, oldPassword, newPassword) => {
    // Đổi mật khẩu người dùng
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy acc. Yêu cầu đăng nhập lại.");
      }

      const response = await http.put(
        "/auth/change-password",
        {
          userId,
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
        let errorMessage = "Yêu cầu không thành công";
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

      const { accessToken, refreshToken } = response.data.token || {};
      if (accessToken && refreshToken) {
        await AsyncStorage.setItem("acc", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      return { message: "Password changed successfully", data: response.data };
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error.message);
      throw error;
    }
  },
  verifyQrToken: async (qrToken) => {
    // Xác minh mã QR để đăng nhập
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
    // Xác nhận đăng nhập bằng mã QR
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

  // Conversation APIs
  conversations: async () => {
    // Lấy danh sách tất cả các cuộc trò chuyện
    return await http.get(`/conversations`);
  },
  getConversationById: async (conversationId) => {
    // Lấy thông tin chi tiết của một cuộc trò chuyện theo ID
    return await http.get(`/conversations/${conversationId}`);
  },
  createConversation: async (receiverId) => {
    // Tạo một cuộc trò chuyện mới với người nhận
    try {
      const response = await http.post("/conversations/create", { receiverId });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi tạo cuộc trò chuyện:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  updateBackground: async (imageBase64, conversationId) => {
    // Cập nhật ảnh nền cho cuộc trò chuyện
    try {
      const response = await http.put(
        `/conversations/mobile/update/background/${conversationId}`,
        {
          imageBase64,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật ảnh nền cuộc trò chuyện:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  removeBackGround: async (conversationId) => {
    // Xóa ảnh nền của cuộc trò chuyện
    try {
      const response = await http.put(
        `/conversations/mobile/update/background/remove/${conversationId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi xóa ảnh nền cuộc trò chuyện:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  //Ghim cuộc trò chuyện
  pinConversation: async (conversationId) => {
    // Ghim cuộc trò chuyện
    try {
      const response = await http.put(`/conversations/pin/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi ghim cuộc trò chuyện:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  //Bỏ ghim cuộc trò chuyện

  unPinConversation: async (conversationId) => {
    // Bỏ ghim cuộc trò chuyện
    try {
      const response = await http.put(`/conversations/unpin/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi bỏ ghim cuộc trò chuyện:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Message APIs
  sendMessage: async ({ conversationId, content }) => {
    // Gửi tin nhắn văn bản trong cuộc trò chuyện
    try {
      const response = await http.post("/messages/send", {
        conversationId,
        content,
      });

      console.log("Phản hồi từ API gửi tin nhắn:", response.data);
      if (response.status === 201) {
        return response.data;
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
  readMessage: async (conversationId) => {
    // Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc
    try {
      const response = await http.put(`/messages/read/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi đánh dấu tin nhắn là đã đọc:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getAllMessages: async (conversationId) => {
    // Lấy tất cả tin nhắn trong một cuộc trò chuyện
    try {
      const response = await http.get(`/messages/all/${conversationId}`);
      return { messages: response.data };
    } catch (error) {
      console.error(
        "Lỗi khi gọi API getMessages:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  sendImageMessage: async ({ conversationId, imageBase64 }) => {
    // Gửi tin nhắn hình ảnh trong cuộc trò chuyện
    try {
      const response = await http.post("/messages/mobile/send-image", {
        conversationId,
        imageBase64,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gửi ảnh:", error.response?.data || error.message);
      throw error;
    }
  },
  sendFileMessage: async ({
    conversationId,
    fileBase64,
    fileName,
    fileType,
  }) => {
    // Gửi tin nhắn tệp tin trong cuộc trò chuyện
    try {
      const response = await http.post("/messages/mobile/send-file", {
        conversationId,
        fileBase64,
        fileName,
        fileType,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi gửi tệp tin:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  sendFileVideoMessage: async ({ conversationId, attachment }) => {
    // Gửi tin nhắn video trong cuộc trò chuyện
    try {
      const response = await http.post("/messages/send-file", {
        conversationId,
        attachment,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi gửi video:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  pinMessage: async (messageId) => {
    // Ghim một tin nhắn trong cuộc trò chuyện
    try {
      const response = await http.put(`/messages/pin/${messageId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi ghim tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  unPinMessage: async (messageId) => {
    // Bỏ ghim một tin nhắn trong cuộc trò chuyện
    try {
      const response = await http.put(`/messages/unpin/${messageId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi bỏ ghim tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  replyMessage: async (messageId, content) => {
    // Trả lời một tin nhắn trong cuộc trò chuyện
    try {
      console.log("messageId:", messageId);
      console.log("content:", content);
      const response = await http.post(`/messages/reply/${messageId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi trả lời tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  recallMessage: async (messageId) => {
    // Thu hồi một tin nhắn đã gửi
    try {
      const response = await http.put(`/messages/recall/${messageId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi thu hồi tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  forwardImageMessage: async (messageId, conversationId) => {
    // Chuyển tiếp một tin nhắn hình ảnh đến cuộc trò chuyện khác
    try {
      const response = await http.post(`/messages/forward/${messageId}`, {
        conversationId,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi chuyển tiếp ảnh:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  deleteMessage: async (messageId) => {
    // Xóa một tin nhắn trong cuộc trò chuyện
    try {
      const response = await http.put(`/messages/delete/${messageId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi xóa tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // User APIs
  getUserById: async (userId) => {
    // Lấy thông tin người dùng theo ID
    return await http.get(`/users/get-user-by-id/${userId}`);
  },
  updateUser: async (userId, params) => {
    // Cập nhật thông tin người dùng
    try {
      const response = await http.put(`/users/mobile/update-info`, {
        userId,
        ...params,
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
    // Tải ảnh đại diện người dùng lên
    try {
      const response = await http.put("/users/mobile/update-avatar", {
        imageBase64,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi tải ảnh lên:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getFriends: async () => {
    // Lấy danh sách bạn bè của người dùng
    try {
      const response = await http.get("/users/friends");
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách bạn bè:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getFriendRequestsSent: async () => {
    // Lấy danh sách lời mời kết bạn đã gửi
    try {
      const response = await http.get("/users/friend-requests-sent");
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách lời mời kết bạn đã gửi:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getFriendRequestsReceived: async () => {
    // Lấy danh sách lời mời kết bạn đã nhận
    try {
      const response = await http.get("/users/friend-requests-received");
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách lời mời kết bạn đã nhận:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  sendFriendRequest: async (userId, message = "") => {
    // Gửi lời mời kết bạn đến một người dùng
    try {
      const response = await http.post(
        `/users/friend-requests/send-request/${userId}`,
        {
          message,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi gửi lời mời kết bạn aspi:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  retrieveFriendRequest: async (requestId) => {
    // Thu hồi lời mời kết bạn đã gửi
    try {
      const response = await http.delete(
        `/users/friend-requests/retrieve-request/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi thu hồi lời mời kết bạn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  acceptFriendRequest: async (requestId) => {
    // Chấp nhận lời mời kết bạn
    try {
      const response = await http.put(
        `/users/friend-requests/accept-request/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi chấp nhận lời mời kết bạn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  rejectFriendRequest: async (requestId) => {
    // Từ chối lời mời kết bạn
    try {
      const response = await http.put(
        `/users/friend-requests/reject-request/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi từ chối lời mời kết bạn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getUserByPhone: async (phone) => {
    // Lấy thông tin người dùng theo số điện thoại
    try {
      const response = await http.get(`/users/get-user/${phone}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error("Không tìm thấy người dùng với số điện thoại này");
      }

      throw error;
    }
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
        };
      }

      // Trả về lỗi custom nếu không đúng format
      throw new Error("Phản hồi từ API không hợp lệ.");
    } catch (error) {
      // Ghi log chi tiết
      // console.error("Lỗi khi kiểm tra số điện thoại:", error?.message);
      // console.error("Chi tiết lỗi:", error?.response?.data || error);

      // Nếu là lỗi từ Axios, giữ nguyên để xử lý ở ngoài
      if (error.response) {
        throw error;
      }

      // Ngược lại, ném lỗi bình thường
      throw new Error("Lỗi không xác định khi kiểm tra số điện thoại.");
    }
  },
  searchUsersByPhones: async (phones) => {
    // Tìm kiếm người dùng theo danh sách số điện thoại
    try {
      const response = await http.post("/users/search-users", {
        phones,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  unfriend: async (userId) => {
    // Hủy kết bạn với một người dùng
    try {
      const response = await http.delete(`/users/friends/unfriend/${userId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi xóa bạn bè:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Group APIs
  createGroupConversation: async (groupName, groupMembers) => {
    // Tạo một nhóm trò chuyện mới
    try {
      console.log("Creating group with:", { groupName, groupMembers });

      const response = await http.post("/conversations/group/create", {
        groupName,
        groupMembers,
      });

      console.log("Group creation response:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "Error creating group conversation:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
  addUserToGroup: async (conversationId, userId) => {
    // Thêm một thành viên vào nhóm
    try {
      const response = await http.put(
        `/conversations/group/${conversationId}/add/${userId}`
      );
      return response.data;
    } catch (error) {
      console.log(
        "Lỗi khi thêm người dùng vào nhóm:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getGroups: async () => {
    // Lấy danh sách tất cả các nhóm
    try {
      const response = await http.get("/conversations/groups");
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách nhóm:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getSameGroups: async (userId) => {
    // Lấy danh sách các nhóm chung với một người dùng
    try {
      const response = await http.get(
        `/conversations/get-same-groups/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách nhóm chung:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  blockUserFromGroup: async (conversationId, userId) => {
    // Chặn một thành viên trong nhóm
    try {
      const response = await http.put(
        `/conversations/group/${conversationId}/block/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi chặn thành viên:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  unblockUserFromGroup: async (conversationId, userId) => {
    // Bỏ chặn một thành viên trong nhóm
    try {
      const response = await http.put(
        `/conversations/group/${conversationId}/unblock/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi bỏ chặn thành viên:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  removeUserFromGroup: async (conversationId, userId) => {
    // Xóa một thành viên khỏi nhóm
    try {
      const response = await http.put(
        `/conversations/group/${conversationId}/remove/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi xóa thành viên khỏi nhóm:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  addOwner: async (conversationId, userId) => {
    // Bổ nhiệm một thành viên làm nhóm trưởng
    try {
      const response = await http.put(
        `/conversations/group/set-owner/${userId}`,
        {
          conversationId,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi bổ nhiệm thành viên làm nhóm trưởng:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  promoteToCoOwner: async (conversationId, userId) => {
    // Bổ nhiệm một thành viên làm nhóm phó
    try {
      const response = await http.put(`/conversations/group/set-co-owner`, {
        conversationId,
        coOwnerIds: [userId],
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi bổ nhiệm thành viên làm nhóm phó:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  removeCoOwner: async (conversationId, userId) => {
    // Xóa quyền nhóm phó của một thành viên
    try {
      const response = await http.put(
        `/conversations/group/${conversationId}/remove-co-owner/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi xóa quyền nhóm phó:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  leaveGroup: async (conversationId) => {
    // Rời khỏi nhóm
    try {
      const response = await http.put(
        `/conversations/group/${conversationId}/leave`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi rời nhóm:", error.response?.data || error.message);
      throw error;
    }
  },
  deleteGroup: async (conversationId) => {
    // Xóa nhóm
    try {
      const response = await http.put(
        `/conversations/group/delete/${conversationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa nhóm:", error.response?.data || error.message);
      throw error;
    }
  },
  changeGroupAvatar: async (conversationId, imageBase64) => {
    // Cập nhật ảnh đại diện của nhóm
    try {
      const response = await http.put(
        `/conversations/mobile/group/update/avatar/${conversationId}`,
        {
          imageBase64,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật ảnh đại diện nhóm:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  changeGroupName: async (conversationId, newName) => {
    // Đổi tên nhóm
    try {
      const response = await http.put(
        `/conversations/group/update/name/${conversationId}`,
        {
          newName,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật tên nhóm:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  // AI APIs
  getAllAIConversations: async () => {
    try {
      const response = await http.get("/ai");
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách cuộc trò chuyện AI:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  processAIRequest: async ({ message, conversationId }) => {
    try {
      const response = await http.post("/ai/ai-assistant", {
        message,
        conversationId,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi gửi yêu cầu đến trợ lý AI:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  translateText: async ({ text, targetLanguage, messageId }) => {
    try {
      const response = await http.post("/ai/translate", {
        text,
        targetLanguage,
        messageId,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi dịch văn bản:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  detectLanguage: async ({ text }) => {
    try {
      const response = await http.post("/ai/detect-language", {
        text,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi phát hiện ngôn ngữ:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Khởi tạo cuộc gọi WebRTC (audio/video)
   * @param {Object} params - { receiverId, type }
   * @returns {Promise<{callId: string}>}
   */
  initiateCall: async ({ receiverId, type }) => {
    try {
      const response = await http.post("/call/initiate", { receiverId, type });
      return response;
    } catch (error) {
      console.error(
        "[api.initiateCall] Lỗi khi gọi /call/initiate:",
        error,
        error?.response?.data
      );
      throw error;
    }
  },
};
