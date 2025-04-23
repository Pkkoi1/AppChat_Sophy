import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DATABASE_API, MY_IP } from "@env";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

// const API = `http://${MY_IP}:3000/api` || DATABASE_API;
const API = `https://sophy-chatapp-be.onrender.com/api`;

// const API = `http://192.168.1.17:3000/api`;

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
        const response = await axios.patch(`${API}/auth/refresh`, undefined, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        // Lưu accessToken mới vào AsyncStorage
        const newAccessToken = response.data.token.accessToken;
        const newRefreshToken = response.data.token.refreshToken; // Nếu có refreshToken mới
        if (newRefreshToken) {
          await AsyncStorage.setItem("refreshToken", newRefreshToken);
        }
        console.log("Phản hồi từ API refreshToken:", response.data);
        await AsyncStorage.setItem("accessToken", newAccessToken);

        // Cập nhật header Authorization và gửi lại request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        console.error("Lỗi khi làm mới token:", refreshError);
        // Nếu refreshToken hết hạn, yêu cầu đăng nhập lại
        await AsyncStorage.removeItem("accessToken");
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
      const callRefreshToken = await AsyncStorage.getItem("refreshToken");
      if (!callRefreshToken) {
        throw new Error(
          "Không tìm thấy callRefreshToken. Yêu cầu đăng nhập lại."
        );
      }

      const response = await http.patch(
        "/auth/refresh",
        undefined, // Không gửi body
        {
          headers: {
            Authorization: `Bearer ${callRefreshToken}`,
          },
        }
      );

      const { accessToken, refreshToken } = response.data.token;
      console.log("Phản hồi từ API refreshToken:", response.data);

      if (!accessToken) {
        throw new Error("API không trả về accessToken mới.");
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
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
    limit = 100
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
        await AsyncStorage.setItem("acc", accessToken);
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
      await AsyncStorage.removeItem("acc");
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
      const token = await AsyncStorage.getItem("acc");
      if (!token) {
        throw new Error("Không tìm thấy acc. Yêu cầu đăng nhập lại.");
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
  //Conversation
  updateBackground: async (imageBase64, conversationId) => {
    try {
      const response = await http.put(
        `/conversations/mobile/update/background/${conversationId}`,
        {
          imageBase64,
        }
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật ảnh nền cuộc trò chuyện:",
        error.response?.data || error.message
      );
      console.error(
        "Lỗi khi cập nhật ảnh nền cuộc trò chuyện 2:",
        conversationId
      );
      throw error;
    }
  },
  removeBackGround: async (conversationId) => {
    // /mobile/update/background/remove
    try {
      const response = await http.put(
        `/conversations/mobile/update/background/remove/${conversationId}`
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi xóa ảnh nền cuộc trò chuyện:",
        error.response?.data || error.message
      );
      console.error("Lỗi khi xóa ảnh nền cuộc trò chuyện 2:", conversationId);
      throw error;
    }
  },
  // Gửi tin nhắn
  sendMessage: async ({ conversationId, content }) => {
    try {
      const response = await http.post("/messages/send", {
        conversationId,
        content,
      });

      console.log("Phản hồi từ API gửi tin nhắn:", response.data);
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
  readMessage: async (conversationId) => {
    try {
      const response = await http.put(`/messages/read/${conversationId}`);
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi đánh dấu tin nhắn là đã đọc:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getAllMessages: async (conversationId) => {
    try {
      const response = await http.get(`/messages/all/${conversationId}`);
      return { messages: response.data }; // trả về giống như BE: array
    } catch (error) {
      console.error(
        "Lỗi khi gọi API getMessages:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  sendImageMessage: async ({ conversationId, imageBase64 }) => {
    try {
      const response = await http.post("/messages/mobile/send-image", {
        conversationId, // Include conversation ID
        imageBase64, // Base64-encoded image
        // content, // Optional text message
      });
      return response.data; // Return the response data
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
    try {
      const response = await http.post("/messages/mobile/send-file", {
        conversationId, // Include conversation ID
        fileBase64, // Base64-encoded file
        fileName,
        fileType,
      });
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi gửi tệp tin:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  sendFileVideoMessage: async ({ conversationId, attachment }) => {
    try {
      const response = await http.post("/messages/send-file", {
        conversationId, // Include conversation ID
        attachment,
      });
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi gửi video:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  pinMessage: async (messageId) => {
    try {
      const response = await http.put(`/messages/pin/${messageId}`);
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi ghim tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  unPinMessage: async (messageId) => {
    try {
      const response = await http.put(`/messages/unpin/${messageId}`);
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi bỏ ghim tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  replyMessage: async (messageId, content) => {
    try {
      console.log("messageId:", messageId);
      console.log("content:", content);
      const response = await http.post(`/messages/reply/${messageId}`, {
        content,
      });
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi trả lời tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  recallMessage: async (messageId) => {
    try {
      const response = await http.put(`/messages/recall/${messageId}`);
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi thu hồi tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  forwardImageMessage: async (messageId, conversationId) => {
    try {
      const response = await http.post(`/messages/forward/${messageId}`, {
        conversationId,
      });
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi chuyển tiếp ảnh:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  deleteMessage: async (messageId) => {
    try {
      const response = await http.put(`/messages/delete/${messageId}`);
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi xóa tin nhắn:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  addOwner: async (conversationId, userId) => {
    try {
      const response = await http.put(
        `/conversations/group/set-owner/${userId}`,
        {
          conversationId,
        }
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi bổ nhiệm thành viên làm nhóm trưởng:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  promoteToCoOwner: async (conversationId, userId) => {
    try {
      const response = await http.put(`/conversations/group/set-co-owner`, {
        conversationId,
        coOwnerIds: [userId], // Pass the userId as part of the coOwnerIds array
      });
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi bổ nhiệm thành viên làm nhóm phó:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  removeCoOwner: async (conversationId, userId) => {
    try {
      const response = await http.put(
        `/conversations/group/${conversationId}/remove-co-owner/${userId}`
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi xóa quyền nhóm phó:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  leaveGroup: async (conversationId) => {
    try {
      // /group/:conversationId/leave
      const response = await http.put(
        `/conversations/group/${conversationId}/leave` // Assuming this is the correct endpoint
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error("Lỗi khi rời nhóm:", error.response?.data || error.message);
      throw error;
    }
  },
  deleteGroup: async (conversationId) => {
    // /group/delete/:conversationId
    try {
      const response = await http.put(
        `/conversations/group/delete/${conversationId}` // Assuming this is the correct endpoint
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error("Lỗi khi xóa nhóm:", error.response?.data || error.message);
      throw error;
    }
  },
  changeGroupAvatar: async (conversationId, imageBase64) => {
    try {
      // /mobile/group/update/avatar/:conversationId
      const response = await http.put(
        `/conversations/mobile/group/update/avatar/${conversationId}`,
        {
          imageBase64, // Gửi ảnh dưới dạng base64
        }
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật ảnh đại diện nhóm:",
        error.response?.data || error.message
      );
      // console.error("Hình ảnh đại diện nhóm không hợp lệ:", imageBase64);
      throw error;
    }
  },
  //Đổi tên nhóm
  changeGroupName: async (conversationId, newName) => {
    try {
      // '/group/update/name/:conversationId
      const response = await http.put(
        `/conversations/group/update/name/${conversationId}`,
        {
          newName, // Gửi tên nhóm mới
        }
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật tên nhóm:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  //Thêm mới vào đây
  getFriends: async () => {
    try {
      const response = await http.get("/users/friends"); // Assuming the endpoint is /users/friends based on backend router
      return response.data; // Return the list of friends
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách bạn bè:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  createConversation: async (receiverId) => {
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
  getConversationById: async (conversationId) => {
    try {
      const response = await http.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      // console.error(
      //   "Lỗi khi lấy thông tin cuộc trò chuyện:",
      //   error.response?.data || error.message
      // );
      throw error;
    }
  },
  // Lấy danh sách lời mời kết bạn đã gửi

  //Friend
  getFriendRequestsSent: async () => {
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

  // Lấy danh sách lời mời kết bạn đã nhận
  getFriendRequestsReceived: async () => {
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
  // Gửi lời mời kết bạn
  sendFriendRequest: async (userId, message = "") => {
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
  // Thu hồi lời mời kết bạn
  retrieveFriendRequest: async (requestId) => {
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

  // Chấp nhận lời mời kết bạn
  acceptFriendRequest: async (requestId) => {
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

  // Từ chối lời mời kết bạn
  rejectFriendRequest: async (requestId) => {
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
    try {
      const response = await http.get(`/users/get-user/${phone}`);
      return response.data;
    } catch (error) {
      // console.error(
      //   "Lỗi khi lấy thông tin người dùng theo số điện thoại:",
      //   error.response?.data || error.message
      // );

      if (error.response && error.response.status === 404) {
        throw new Error("Không tìm thấy người dùng với số điện thoại này");
      }

      throw error;
    }
  },
  // Tìm kiếm người dùng theo danh sách số điện thoại
  searchUsersByPhones: async (phones) => {
    try {
      const response = await http.post("/users/search-users", {
        phones, // axios sẽ tự chuyển mảng thành nhiều phones=... trên query string
      });
      return response.data;
    } catch (error) {
      // console.error(
      //   "Lỗi khi tìm kiếm người dùng theo số điện thoại:",
      //   error.response?.data || error.message
      // );
      throw error;
    }
  },
  unfriend: async (userId) => {
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
  createGroupConversation: async (groupName, groupMembers) => {
    try {
      console.log("Creating group with:", { groupName, groupMembers }); // Log input

      const response = await http.post("/conversations/group/create", {
        groupName,
        groupMembers,
      });

      console.log("Group creation response:", response.data); // Log the response

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
    try {
      const response = await http.put(
        `/conversations/group/${conversationId}/add/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi thêm người dùng vào nhóm:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getGroups: async () => {
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
};
