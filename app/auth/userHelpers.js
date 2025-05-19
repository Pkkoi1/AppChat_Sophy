import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { pickExternalDirectory } from "@/app/storage/StorageService";
import { Alert } from "react-native";

/**
 * Lấy thông tin user theo id.
 */
export const getUserInfoById = async (setUserInfo, id) => {
  try {
    const res = await api.getUserById(id);
    setUserInfo(res.data);
    await AsyncStorage.setItem("userInfo", JSON.stringify(res.data));
  } catch (err) {
    console.error("Error fetching user info:", err);
  }
};

/**
 * Cập nhật thông tin user.
 */
export const updateUserInfo = async (setUserInfo, userInfo, newInfo) => {
  const updated = { ...userInfo, ...newInfo };
  setUserInfo(updated);
  await AsyncStorage.setItem("userInfo", JSON.stringify(updated));
};

/**
 * Đăng nhập.
 */
export const login = async ({
  params,
  setAccessToken,
  setRefreshToken,
  setUserInfo,
  socket,
  handlerRefresh,
}) => {
  try {
    const response = await api.login(params);
    const { accessToken, refreshToken } = response.data.token;
    const userId = response.data.user.userId;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    await AsyncStorage.setItem("userId", userId);
    await getUserInfoById(setUserInfo, userId);

    // Yêu cầu chọn thư mục lưu trữ nếu chưa có
    const dirUri = await AsyncStorage.getItem("SHOPY_DIRECTORY_URI");
    if (!dirUri) {
      try {
        await pickExternalDirectory();
      } catch (err) {
        Alert.alert(
          "Chọn thư mục lưu trữ",
          "Bạn cần chọn thư mục lưu trữ để tiếp tục sử dụng ứng dụng."
        );
        throw err;
      }
    }

    if (socket && socket.connected) {
      socket.emit("authenticate", userId);
    }

    await handlerRefresh();
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Sai số điện thoại hoặc mật khẩu.");
    } else if (error.response?.status === 500) {
      throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
    } else {
      throw new Error("Đã xảy ra lỗi. Vui lòng kiểm tra kết nối mạng.");
    }
  }
};

/**
 * Đăng ký.
 */
export const register = async ({
  params,
  setAccessToken,
  setRefreshToken,
  setUserInfo,
  socket,
  handlerRefresh,
}) => {
  try {
    const response = await api.registerAccount(params);
    const { accessToken, refreshToken } = response.token;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    await getUserInfoById(setUserInfo, response.user.userId);

    // Yêu cầu chọn thư mục lưu trữ nếu chưa có
    const dirUri = await AsyncStorage.getItem("SHOPY_DIRECTORY_URI");
    if (!dirUri) {
      try {
        await pickExternalDirectory();
      } catch (err) {
        Alert.alert(
          "Chọn thư mục lưu trữ",
          "Bạn cần chọn thư mục lưu trữ để tiếp tục sử dụng ứng dụng."
        );
        throw err;
      }
    }

    if (socket && socket.connected) {
      socket.emit("authenticate", response.user.userId);
    }

    await handlerRefresh();
  } catch (error) {
    throw error;
  }
};

/**
 * Đăng xuất.
 */
export const logout = async ({
  setAccessToken,
  setRefreshToken,
  setUserInfo,
  setConversations,
  setBackground,
  clearStorage,
}) => {
  try {
    await clearStorage();
    await api.logout();
  } catch (error) {
    console.error("Lỗi khi logout:", error.message);
  } finally {
    setAccessToken(null);
    setRefreshToken(null);
    setUserInfo(null);
    setConversations([]);
    setBackground(null);
    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "userInfo",
      "conversations",
      "background",
      "messages",
    ]);
  }
};
