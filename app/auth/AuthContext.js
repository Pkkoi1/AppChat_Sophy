import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../socket/SocketContext"; // Import SocketContext

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setaccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]); // State for conversations
  const [background, setBackground] = useState(null); // State for background

  const socket = useContext(SocketContext); // Get socket from context
  const flatListRef = useRef(null); // Optional: Reference for scrolling if needed

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [token, refresh, user, storedConversations, storedBackground] =
          await AsyncStorage.multiGet([
            "accessToken",
            "refreshToken",
            "userInfo",
            "conversations", // Load conversations from AsyncStorage
            "background", // Load background from AsyncStorage
          ]);

        if (token[1] && refresh[1] && user[1]) {
          setaccessToken(token[1]);
          setRefreshToken(refresh[1]);
          setUserInfo(JSON.parse(user[1]));
        }

        if (storedConversations[1]) {
          setConversations(JSON.parse(storedConversations[1])); // Update conversations state
        }

        if (storedBackground[1]) {
          setBackground(storedBackground[1]); // Update background state
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

        flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 }); // Optional: Scroll to top
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
    handleNewMessage(); // Start listening for new messages
    return () => cleanupNewMessage(); // Cleanup on unmount
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
    // Lấy danh sách cuộc trò chuyện sau khi đăng nhập
    if (socket && response.data.user.userId) {
      socket.emit("authenticate", response.data.user.userId);
    }

    const conversationsResponse = await api.conversations();
    if (conversationsResponse && conversationsResponse.data) {
      setConversations(conversationsResponse.data); // Lưu danh sách vào state
      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(conversationsResponse.data)
      ); // Lưu vào AsyncStorage
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
      setConversations([]); // Xóa danh sách cuộc trò chuyện
      setBackground(null); // Xóa background
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "userInfo",
        "conversations", // Xóa danh sách cuộc trò chuyện khỏi AsyncStorage
        "background", // Xóa background khỏi AsyncStorage
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
        setConversations(conversationsResponse.data); // Update state with new conversations
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(conversationsResponse.data)
        ); // Save updated conversations to AsyncStorage
      }
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    }
  };

  const updateBackground = async (newBackground) => {
    setBackground(newBackground); // Update state
    await AsyncStorage.setItem("background", newBackground); // Save to AsyncStorage
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        userInfo,
        isLoading,
        conversations,
        background, // Expose background state
        register,
        login,
        logout,
        updateUserInfo,
        getUserInfoById,
        handlerRefresh,
        updateBackground, // Expose updateBackground function
        flatListRef, // Optional: Expose flatListRef if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
