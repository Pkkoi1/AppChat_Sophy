import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback, // Import useCallback
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../socket/SocketContext";
import * as Contacts from "expo-contacts"; // Import Contacts
import {
  checkStoragePaths,
  getConversations,
  pickExternalDirectory,
  saveConversations,
} from "../storage/StorageService"; // Import storage helpers
import { Alert, Linking } from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setaccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [background, setBackground] = useState(null);
  const [phoneContacts, setPhoneContacts] = useState([]); // Add state for phone contacts
  const [usersInDB, setUsersInDB] = useState([]); // Add state for users in DB
  const [contactsLoading, setContactsLoading] = useState(false); // Add loading state for contacts
  const [contactsError, setContactsError] = useState(null); // Add error state for contacts
  const [groups, setGroups] = useState([]); // Add state for groups
  const [groupsLoading, setGroupsLoading] = useState(false); // Add loading state for groups

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
    const userId = response.data.user.userId;

    setaccessToken(accessToken);
    setRefreshToken(refreshToken);

    // ✅ Lưu userId vào AsyncStorage để dùng cho lưu file
    await AsyncStorage.setItem("userId", userId);

    // Lấy full thông tin user
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
          (!conversation.isGroup || conversation.groupMembers.includes(userId)) // Ensure the user is part of the group if it's a group conversation
      );

      setConversations(filteredConversations);
      await saveConversations(filteredConversations); // Lúc này userId đã có
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
            conversation.groupMembers.includes(response.user.userId)) // Ensure the user is part of the group if it's a group conversation
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
              conversation.groupMembers.includes(userInfo?.userId)) // Ensure the user is part of the group if it's a group conversation
        );

        setConversations(filteredConversations);
        await saveConversations(filteredConversations);
      }
      // Also refresh groups
      await fetchGroups();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const updateBackground = async (newBackground) => {
    setBackground(newBackground);
    await AsyncStorage.setItem("background", newBackground);
  };

  // Function to fetch phone contacts
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
  }, []); // Empty dependency array - this function doesn't depend on any state

  // Function to fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const response = await api.getGroups();

      if (response) {
        // Sort groups by latest message timestamp
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

        // Save groups to AsyncStorage for offline access
        await AsyncStorage.setItem("groups", JSON.stringify(sortedGroups));
      }

      return response;
    } catch (error) {
      console.error("Error fetching groups:", error);

      // Try to load from AsyncStorage if network request fails
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

  // Load groups on initial load
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
        phoneContacts, // Provide phone contacts
        usersInDB, // Provide users in DB
        getPhoneContacts, // Provide the function
        contactsLoading, // Provide loading state
        contactsError, // Provide error state
        groups, // Provide groups
        groupsLoading, // Provide groups loading state
        fetchGroups, // Provide fetchGroups function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
