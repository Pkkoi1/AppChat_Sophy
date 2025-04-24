import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../socket/SocketContext";
import * as Contacts from "expo-contacts";
import {
  checkStoragePaths,
  getConversations,
  pickExternalDirectory,
  saveConversations,
} from "../storage/StorageService";
import { Alert, Linking } from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setaccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [background, setBackground] = useState(null);
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [usersInDB, setUsersInDB] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

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

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({
      conversationId: incomingConversationId,
      message,
    }) => {
      const formattedMessage = message._doc || message;

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === incomingConversationId
            ? { ...conv, lastMessage: formattedMessage, unreadCount: [] }
            : conv
        )
      );

      flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
      console.log("🟢 Nhận tin nhắn mới:", formattedMessage);
    };

    const handleNewConversation = ({ conversation }) => {
      console.log("🟢 Nhận cuộc trò chuyện mới:", conversation);
      addConversation(conversation); // Thêm mới vào danh sách
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newConversation", handleNewConversation);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newConversation", handleNewConversation);
    };
  }, [socket, addConversation]);

  const checkLastMessageDifference = async (conversationId) => {
    try {
      // Lấy tin nhắn cuối cùng từ state cục bộ
      const localConversation = conversations.find(
        (conv) => conv.conversationId === conversationId
      );
      const localLastMessage = localConversation?.lastMessage || null;

      // Lấy tin nhắn từ server
      const response = await api.getAllMessages(conversationId);
      if (!response || !response.messages) {
        throw new Error("API không trả về dữ liệu tin nhắn hợp lệ.");
      }

      const serverMessages = response.messages.filter(
        (m) => !m.hiddenFrom?.includes(userInfo?.userId)
      );
      const serverLastMessage = serverMessages[0] || null;

      // So sánh
      if (!localLastMessage && !serverLastMessage) {
        console.log("Không có tin nhắn nào ở cả hai bên.");
        return {
          isDifferent: false,
          details: "Không có tin nhắn ở cả hai bên",
        };
      }

      if (!localLastMessage || !serverLastMessage) {
        console.log("Một bên không có tin nhắn.");
        return {
          isDifferent: true,
          details: `Cục bộ: ${
            localLastMessage ? "Có tin nhắn" : "Không có"
          }, Server: ${serverLastMessage ? "Có tin nhắn" : "Không có"}`,
        };
      }

      const isDifferent =
        localLastMessage.messageDetailId !==
          serverLastMessage.messageDetailId ||
        localLastMessage.content !== serverLastMessage.content ||
        localLastMessage.createdAt !== serverLastMessage.createdAt;

      if (isDifferent) {
        console.log("Tin nhắn cuối cùng khác nhau:", {
          local: {
            id: localLastMessage.messageDetailId,
            content: localLastMessage.content,
            createdAt: localLastMessage.createdAt,
          },
          server: {
            id: serverLastMessage.messageDetailId,
            content: serverLastMessage.content,
            createdAt: serverLastMessage.createdAt,
          },
        });
      } else {
        console.log("Tin nhắn cuối cùng khớp giữa client và server.");
      }

      return {
        isDifferent,
        details: isDifferent
          ? `Cục bộ: ${localLastMessage.messageDetailId}, Server: ${serverLastMessage.messageDetailId}`
          : "Tin nhắn khớp",
      };
    } catch (error) {
      console.error("Lỗi kiểm tra tin nhắn cuối cùng:", error);
      return {
        isDifferent: true,
        details: `Lỗi: ${error.message}`,
      };
    }
  };

  const addConversation = async (conversationData) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!conversationData.conversationId) {
        throw new Error("Thiếu conversationId.");
      }

      // Cập nhật cục bộ trước
      const newConversation = {
        ...conversationData,
        isGroup: conversationData.isGroup || false,
        groupMembers: conversationData.groupMembers || [],
        lastMessage: null,
        isDeleted: false,
        formerMembers: [],
      };

      const updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      await saveConversations(updatedConversations);
      console.log(
        `Đã thêm cuộc trò chuyện ${conversationData.conversationId} cục bộ.`
      );
      return newConversation;
    } catch (error) {
      console.error("Lỗi khi thêm cuộc trò chuyện:", error);

      // Hoàn tác thay đổi cục bộ
      const revertedConversations = conversations;
      setConversations(revertedConversations);
      await saveConversations(revertedConversations);
      throw error;
    }
  };

  const removeConversation = async (conversationId) => {
    try {
      // Kiểm tra tin nhắn cuối trước khi xóa
      const { isDifferent } = await checkLastMessageDifference(conversationId);
      if (isDifferent) {
        console.warn(
          "Tin nhắn cuối không đồng bộ trước khi xóa cuộc trò chuyện."
        );
        await handlerRefresh();
      }

      // Cập nhật cục bộ
      const updatedConversations = conversations.filter(
        (conv) => conv.conversationId !== conversationId
      );
      setConversations(updatedConversations);
      await saveConversations(updatedConversations);
      console.log(`Đã xóa cuộc trò chuyện ${conversationId} cục bộ.`);

      // Gọi API để xóa trên server
      const response = await api.deleteConversation(conversationId);
      console.log(`Đã xóa cuộc trò chuyện trên server:`, response);

      // Cập nhật socket
      if (socket && socket.connected) {
        socket.emit("conversationRemoved", {
          conversationId,
          userId: userInfo?.userId,
        });
      }

      return response;
    } catch (error) {
      console.error("Lỗi khi xóa cuộc trò chuyện:", error);
      Alert.alert(
        "Lỗi",
        `Không thể xóa cuộc trò chuyện: ${
          error.response?.data?.message || error.message
        }`
      );

      // Hoàn tác thay đổi cục bộ
      const revertedConversations = conversations;
      setConversations(revertedConversations);
      await saveConversations(revertedConversations);
      throw error;
    }
  };

  const login = async (params) => {
    const response = await api.login(params);
    const { accessToken, refreshToken } = response.data.token;
    const userId = response.data.user.userId;

    setaccessToken(accessToken);
    setRefreshToken(refreshToken);

    await AsyncStorage.setItem("userId", userId);
    await getUserInfoById(userId);

    if (socket && userId) {
      socket.emit("authenticate", userId);
    }

    await ensureStoragePermission();

    const conversationsResponse = await api.conversations();
    if (conversationsResponse && conversationsResponse.data) {
      const filteredConversations = conversationsResponse.data.filter(
        (conversation) =>
          !conversation.formerMembers.includes(userId) &&
          !conversation.isDeleted &&
          (!conversation.isGroup || conversation.groupMembers.includes(userId))
      );

      setConversations(filteredConversations);
      await saveConversations(filteredConversations);
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
      const filteredConversations = conversationsResponse.data.filter(
        (conversation) =>
          !conversation.formerMembers.includes(response.user.userId) &&
          !conversation.isDeleted &&
          (!conversation.isGroup ||
            conversation.groupMembers.includes(response.user.userId))
      );

      setConversations(filteredConversations);
      await saveConversations(filteredConversations);
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
        const filteredConversations = conversationsResponse.data.filter(
          (conversation) =>
            !conversation.formerMembers.includes(userInfo?.userId) &&
            !conversation.isDeleted &&
            (!conversation.isGroup ||
              conversation.groupMembers.includes(userInfo?.userId))
        );

        setConversations(filteredConversations);
        await saveConversations(filteredConversations);
      }
      await fetchGroups();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const updateBackground = async (newBackground) => {
    setBackground(newBackground);
    await AsyncStorage.setItem("background", newBackground);
  };

  const getPhoneContacts = useCallback(async () => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          const formattedContacts = data
            .filter(
              (contact) =>
                contact.name &&
                contact.phoneNumbers &&
                contact.phoneNumbers.length > 0
            )
            .map((contact) => {
              const phoneNumber = contact.phoneNumbers[0].number.replace(
                /[\s\-()]/g,
                ""
              );
              return {
                _id: contact.id,
                fullname: contact.name,
                phone: phoneNumber,
                isPhoneContact: true,
              };
            });

          const phoneNumbers = formattedContacts.map((c) => c.phone);

          try {
            const users = await api.searchUsersByPhones(phoneNumbers);
            setUsersInDB(users || []);
          } catch (err) {
            console.error("Error searching users by phones:", err);
          }

          setPhoneContacts(formattedContacts);
        } else {
          setPhoneContacts([]);
          setUsersInDB([]);
        }
      } else {
        Alert.alert(
          "Cần quyền truy cập danh bạ",
          "Ứng dụng cần quyền truy cập danh bạ để hiển thị danh sách liên hệ của bạn",
          [
            { text: "Đóng", style: "cancel" },
            { text: "Cài đặt", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (err) {
      setContactsError("Không thể truy cập danh bạ điện thoại: " + err.message);
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const response = await api.getGroups();

      if (response) {
        const sortedGroups = response.sort((a, b) => {
          const dateA = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt)
            : new Date(0);
          const dateB = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt)
            : new Date(0);
          return dateB - dateA;
        });

        setGroups(sortedGroups);
        await AsyncStorage.setItem("groups", JSON.stringify(sortedGroups));
      }

      return response;
    } catch (error) {
      console.error("Error fetching groups:", error);
      try {
        const cachedGroups = await AsyncStorage.getItem("groups");
        if (cachedGroups) {
          setGroups(JSON.parse(cachedGroups));
        }
      } catch (storageError) {
        console.error("Error loading cached groups:", storageError);
      }

      return [];
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCachedGroups = async () => {
      try {
        const cachedGroups = await AsyncStorage.getItem("groups");
        if (cachedGroups) {
          setGroups(JSON.parse(cachedGroups));
        }
      } catch (error) {
        console.error("Error loading cached groups:", error);
      }
    };

    if (userInfo?.userId) {
      loadCachedGroups();
      fetchGroups();
    }
  }, [userInfo?.userId]);

  useEffect(() => {
    if (socket && conversations.length > 0 && userInfo?.userId) {
      const allIds = conversations.map((conv) => conv.conversationId);
      socket.emit("joinUserConversations", allIds);
      console.log("📡 Đã join tất cả conversations:", allIds);
    }
  }, [socket, conversations, userInfo?.userId]);

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
        phoneContacts,
        usersInDB,
        getPhoneContacts,
        contactsLoading,
        contactsError,
        groups,
        groupsLoading,
        fetchGroups,
        addConversation, // Thêm hàm mới
        removeConversation, // Thêm hàm mới
        checkLastMessageDifference, // Thêm hàm mới
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
