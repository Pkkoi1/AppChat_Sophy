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
  const [conversations, setConversations] = useState([]); // Thêm state conversations

  const socket = useContext(SocketContext); // Get socket from context

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [token, refresh, user, storedConversations] =
          await AsyncStorage.multiGet([
            "accessToken",
            "refreshToken",
            "userInfo",
            "conversations", // Lấy danh sách cuộc trò chuyện từ AsyncStorage
          ]);

        if (token[1] && refresh[1] && user[1]) {
          setaccessToken(token[1]);
          setRefreshToken(refresh[1]);
          setUserInfo(JSON.parse(user[1]));
        }

        if (storedConversations[1]) {
          setConversations(JSON.parse(storedConversations[1])); // Cập nhật state conversations
        }
      } catch (err) {
        console.error("Error loading storage:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorage();
  }, []);

  const login = async (params) => {
    const response = await api.login(params);
    const { accessToken, refreshToken } = response.data.token;

    setaccessToken(accessToken);
    setRefreshToken(refreshToken);

    await getUserInfoById(response.data.user.userId);

    if (socket && response.data.user.userId) {
      socket.emit("authenticate", response.data.user.userId);
    }

    // Lấy danh sách cuộc trò chuyện sau khi đăng nhập
    const conversationsResponse = await api.conversations();
    if (conversationsResponse && conversationsResponse.data) {
      setConversations(conversationsResponse.data); // Lưu danh sách vào state
      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(conversationsResponse.data)
      ); // Lưu vào AsyncStorage
    }
  };

  const register = async (params) => {
    const response = await api.registerAccount(params);
    console.log("Phan hoi tu register:", response.user);
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
      setConversations([]); // Xóa danh sách cuộc trò chuyện
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "userInfo",
        "conversations", // Xóa danh sách cuộc trò chuyện khỏi AsyncStorage
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
        conversations,
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
