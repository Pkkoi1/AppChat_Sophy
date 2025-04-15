import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../socket/SocketContext"; // Import SocketContext

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setaccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useContext(SocketContext); // Get socket from context

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [token, refresh, user] = await AsyncStorage.multiGet([
          "accessToken",
          "refreshToken",
          "userInfo",
        ]);

        if (token[1] && refresh[1] && user[1]) {
          setaccessToken(token[1]);
          setRefreshToken(refresh[1]);
          setUserInfo(JSON.parse(user[1]));
        }
      } catch (err) {
        console.error("Error loading storage:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorage();
  }, []);

  const refreshAccessToken = async () => {
    console.log("refreshAccessToken được gọi");
    console.log("Giá trị refreshToken trong state:", refreshToken);
    console.log("Giá trị userInfo trong state:", userInfo);
    console.log("Giá trị accessToken trong state:", accessToken);

    try {
      // Lấy refreshToken từ AsyncStorage nếu không có trong state
      const storedRefreshToken =
        refreshToken || (await AsyncStorage.getItem("refreshToken"));

      if (!storedRefreshToken) {
        console.error("No refresh token available");
        return;
      }

      const response = await api.refreshToken({
        refreshToken: storedRefreshToken,
      });
      const { accessToken: newAccessToken } = response.token;
      const { refreshToken: newRefreshToken } = response.token;
      console.log("Phan hoi tu refresh token ở context:", response);

      setaccessToken(newAccessToken);
      await AsyncStorage.setItem("accessToken", newAccessToken);
      await AsyncStorage.setItem("refreshToken", newRefreshToken);

      // Lấy thông tin người dùng sau khi refresh token
      if (userInfo?.userId) {
        await getUserInfoById(userInfo.userId);
      }
    } catch (error) {
      console.error("Error refreshing access token:", error);
      logout(); // Đăng xuất nếu refresh token không hợp lệ
    }
  };

  const login = async (params) => {
    const response = await api.login(params);
    const { accessToken, refreshToken } = response.data.token;

    setaccessToken(accessToken);
    setRefreshToken(refreshToken);

    await getUserInfoById(response.data.user.userId);

    if (socket && response.data.user.userId) {
      socket.emit("authenticate", response.data.user.userId);
    }
  };

  const register = async (params) => {
    const response = await api.registerAccount(params);
    const { accessToken, refreshToken } = response.token;

    setaccessToken(accessToken);
    setRefreshToken(refreshToken);

    await getUserInfoById(response.user.userId);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Lỗi khi logout:", error.message);
    } finally {
      setaccessToken(null);
      setRefreshToken(null);
      setUserInfo(null);
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "userInfo",
      ]);
    }
  };

  const getUserInfoById = async (id) => {
    try {
      const res = await api.getUserById(id);
      setUserInfo(res.data);
      await AsyncStorage.setItem("userInfo", JSON.stringify(res.data));
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const updateUserInfo = async (newInfo) => {
    const updated = { ...userInfo, ...newInfo };
    setUserInfo(updated);
    await AsyncStorage.setItem("userInfo", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        userInfo,
        isLoading,
        register,
        login,
        logout,
        updateUserInfo,
        getUserInfoById,
        // refreshAccessToken, // Expose the refreshAccessToken function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
