import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load dữ liệu từ AsyncStorage khi app khởi chạy
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const refresh = await AsyncStorage.getItem("refreshToken");
        const user = await AsyncStorage.getItem("userInfo");

        if (token && refresh && user) {
          setAuthToken(token);
          setRefreshToken(refresh);
          setUserInfo(JSON.parse(user));
        }
      } catch (err) {
        console.error("Lỗi khi load auth context:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  const login = async (params) => {
    const response = await api.login(params);
    const { accessToken, refreshToken } = response.data.token;

    setAuthToken(accessToken);
    setRefreshToken(refreshToken);

    // Sau khi đăng nhập thành công, gọi getUserInfoById để lấy thông tin chi tiết người dùng
    await getUserInfoById(response.data.user.userId);

    await AsyncStorage.setItem("authToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
  };

  const logout = async () => {
    await api.logout();

    setAuthToken(null);
    setRefreshToken(null);
    setUserInfo(null);

    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userInfo");
  };

  const updateUserInfo = async (newInfo) => {
    const updated = { ...userInfo, ...newInfo };
    setUserInfo(updated);
    await AsyncStorage.setItem("userInfo", JSON.stringify(updated));
  };

  const getUserInfoById = async (id) => {
    try {
      const response = await api.getUserById(id || userInfo.userId); // Nếu không có id, sử dụng userId hiện tại
      setUserInfo(response.data);
      await AsyncStorage.setItem("userInfo", JSON.stringify(response.data));
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng ở context:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        refreshToken,
        userInfo,
        isLoading,
        login,
        logout,
        updateUserInfo,
        getUserInfoById, // Cung cấp hàm getUserInfoById cho các thành phần sử dụng
        setUserInfo, // Nếu muốn cập nhật toàn bộ userInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};