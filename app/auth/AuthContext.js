import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../socket/SocketContext";
import {
  checkStoragePaths,
  getConversations,
  pickExternalDirectory,
  saveConversations,
} from "../storage/StorageService"; // Import storage helpers

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setaccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [background, setBackground] = useState(null);

  const socket = useContext(SocketContext);
  const flatListRef = useRef(null);

  const ensureStoragePermission = async () => {
    const savedUri = await AsyncStorage.getItem("SHOPY_DIRECTORY_URI");
    if (!savedUri) {
      try {
        const pickedUri = await pickExternalDirectory();
        console.log("📁 Thư mục đã chọn:", pickedUri);
      } catch (err) {
        console.error("❌ Không thể chọn thư mục lưu trữ:", err.message);
      }
    } else {
      console.log("📁 Đã có thư mục lưu trữ:", savedUri);
    }
  };

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [token, refresh, user, storedBackground] =
          await AsyncStorage.multiGet([
            "accessToken",
            "refreshToken",
            "userInfo",
            "background",
          ]);

        if (token[1] && refresh[1] && user[1]) {
          setaccessToken(token[1]);
          setRefreshToken(refresh[1]);
          setUserInfo(JSON.parse(user[1]));
        }

        const cachedConversations = await getConversations();
        if (cachedConversations?.length > 0) {
          setConversations(cachedConversations);
        }

        if (storedBackground[1]) {
          setBackground(storedBackground[1]);
        }
      } catch (err) {
        console.error("Error loading storage:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorage();
  }, []);

  const handleNewMessage = () => {
    if (!socket) return;

    socket.on(
      "newMessage",
      ({ conversationId: incomingConversationId, message }) => {
        const formattedMessage = message._doc || message;

        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.conversationId === incomingConversationId
              ? { ...conv, lastMessage: formattedMessage }
              : conv
          )
        );

        flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
        console.log("Nhận tin nhắn mới qua socket:", formattedMessage);
      }
    );
  };

  const cleanupNewMessage = () => {
    if (socket) {
      socket.off("newMessage");
    }
  };

  useEffect(() => {
    handleNewMessage();
    return () => cleanupNewMessage();
  }, [socket]);

  const login = async (params) => {
    const response = await api.login(params);
    const { accessToken, refreshToken } = response.data.token;

    setaccessToken(accessToken);
    setRefreshToken(refreshToken);

    await getUserInfoById(response.data.user.userId);

    if (socket && response.data.user.userId) {
      socket.emit("authenticate", response.data.user.userId);
    }
    await ensureStoragePermission();
    const conversationsResponse = await api.conversations();
    if (conversationsResponse && conversationsResponse.data) {
      setConversations(conversationsResponse.data);
      await saveConversations(conversationsResponse.data);
    }
  };

  const register = async (params) => {
    const response = await api.registerAccount(params);
    const { accessToken, refreshToken } = response.token;

    setaccessToken(accessToken);
    setRefreshToken(refreshToken);

    await getUserInfoById(response.user.userId);

    if (socket && response.user.userId) {
      socket.emit("authenticate", response.user.userId);
    }
    await ensureStoragePermission();
    const conversationsResponse = await api.conversations();
    if (conversationsResponse && conversationsResponse.data) {
      setConversations(conversationsResponse.data);
      await saveConversations(conversationsResponse.data);
    }
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

  const handlerRefresh = async () => {
    try {
      const conversationsResponse = await api.conversations();
      if (conversationsResponse && conversationsResponse.data) {
        setConversations(conversationsResponse.data);
        await saveConversations(conversationsResponse.data);
      }
      // checkStoragePaths(); // Check storage paths after refreshing conversations
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    }
  };

  const updateBackground = async (newBackground) => {
    setBackground(newBackground);
    await AsyncStorage.setItem("background", newBackground);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        userInfo,
        isLoading,
        conversations,
        background,
        register,
        login,
        logout,
        updateUserInfo,
        getUserInfoById,
        handlerRefresh,
        updateBackground,
        flatListRef,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
