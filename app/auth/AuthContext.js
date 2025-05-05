import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  memo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../socket/SocketContext";
import * as Contacts from "expo-contacts";
import { Alert, Linking } from "react-native";
import { fetchName } from "../components/getUserInfo/UserName";
import { setupAuthSocketEvents } from "../socket/socketEvents/AuthSocketEvents";

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
  const [groupMember, setGroupMember] = useState([]);

  const socket = useContext(SocketContext);
  const flatListRef = useRef(null);

  useEffect(() => {
    clearStorage();
  }, []);

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
    const cleanup = setupAuthSocketEvents(
      socket,
      userInfo,
      setConversations,
      saveMessages,
      addConversation
    );
    return cleanup;
  }, [socket, userInfo, setConversations, saveMessages, addConversation]);

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log("Đã xóa sạch dữ liệu AsyncStorage");
    } catch (e) {
      console.error("Lỗi khi xóa AsyncStorage:", e);
    }
  };

  const checkLastMessageDifference = async (conversationId) => {
    try {
      const localConversation = conversations.find(
        (conv) => conv.conversationId === conversationId
      );
      const localLastMessage = localConversation?.lastMessage || null;

      const response = await api.getAllMessages(conversationId);
      if (!response || !response.messages) {
        throw new Error("API không trả về dữ liệu tin nhắn hợp lệ.");
      }

      const serverMessages = response.messages.filter(
        (m) => !m.hiddenFrom?.includes(userInfo?.userId)
      );
      const serverLastMessage = serverMessages[0] || null;

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
      if (!conversationData.conversationId) {
        throw new Error("Thiếu conversationId.");
      }

      const updatedConversations = Array.from(
        new Map(
          [{ ...conversationData, messages: [] }, ...conversations].map(
            (conv) => [conv.conversationId, conv]
          )
        ).values()
      );

      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(updatedConversations)
      );
      console.log(
        `Đã thêm cuộc trò chuyện ${conversationData.conversationId} cục bộ.`
      );
      return conversationData;
    } catch (error) {
      console.error("Lỗi khi thêm cuộc trò chuyện:", error);
      setConversations(conversations);
      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
      );
      throw error;
    }
  };

  const removeConversation = async (conversationId) => {
    try {
      const { isDifferent } = await checkLastMessageDifference(conversationId);
      if (isDifferent) {
        console.warn(
          "Tin nhắn cuối không đồng bộ trước khi xóa cuộc trò chuyện."
        );
        await handlerRefresh();
      }

      const updatedConversations = conversations.filter(
        (conv) => conv.conversationId !== conversationId
      );
      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(updatedConversations)
      );
      console.log(`Đã xóa cuộc trò chuyện ${conversationId} cục bộ.`);

      const response = await api.deleteConversation(conversationId);
      console.log(`Đã xóa cuộc trò chuyện trên server:`, response);

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

      const revertedConversations = conversations;
      setConversations(revertedConversations);
      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(revertedConversations)
      );
      throw error;
    }
  };

  const updateGroupMembers = async (conversationId, newMembers) => {
    try {
      if (!conversationId || !Array.isArray(newMembers)) {
        throw new Error(
          "Thiếu conversationId hoặc danh sách thành viên không hợp lệ."
        );
      }

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? { ...conv, groupMembers: [...conv.groupMembers, ...newMembers] }
            : conv
        )
      );

      setGroupMember((prevMembers) => [
        ...prevMembers,
        ...newMembers.filter(
          (newMember) =>
            !prevMembers.some((member) => member.id === newMember.id)
        ),
      ]);

      console.log(
        `Đã thêm danh sách thành viên mới vào nhóm ${conversationId}:`,
        newMembers
      );
    } catch (error) {
      console.error("Lỗi khi thêm danh sách thành viên mới:", error);
      throw error;
    }
  };

  const changeRole = async (conversationId, memberId, newRole) => {
    try {
      if (!conversationId || !memberId || !newRole) {
        throw new Error("Thiếu conversationId, memberId hoặc role.");
      }

      setGroupMember((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );

      console.log(
        `Đã thay đổi vai trò của thành viên ${memberId} thành ${newRole} trong nhóm ${conversationId}. \n Danh sách ${groupMember}`
      );
    } catch (error) {
      console.error("Lỗi khi thay đổi vai trò thành viên:", error);
      throw error;
    }
  };

  const removeGroupMember = async (conversationId, memberId) => {
    try {
      if (!conversationId || !memberId) {
        throw new Error("Thiếu conversationId hoặc memberId.");
      }

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                groupMembers: conv.groupMembers.filter((id) => id !== memberId),
              }
            : conv
        )
      );

      setGroupMember((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );

      console.log(`Đã xóa thành viên ${memberId} khỏi nhóm ${conversationId}.`);
    } catch (error) {
      console.error("Lỗi khi xóa thành viên nhóm:", error);
      throw error;
    }
  };

  const saveGroupMembers = async (conversationId, members) => {
    try {
      if (!conversationId || !Array.isArray(members)) {
        throw new Error(
          "Thiếu conversationId hoặc danh sách thành viên không hợp lệ."
        );
      }

      setGroupMember(members);
      console.log(
        `Đã lưu danh sách thành viên nhóm với vai trò cho ${conversationId}:`,
        members
      );
    } catch (error) {
      console.error("Lỗi khi lưu danh sách thành viên nhóm:", error);
      throw error;
    }
  };

  const saveMessages = useCallback(
    async (
      conversationId,
      newMessages,
      position = "before",
      onSaveComplete
    ) => {
      try {
        // console.log(
        //   "Bắt đầu lưu tin nhắn:",
        //   newMessages.map((msg) => msg.content)
        // );

        // Lấy danh sách conversations từ AsyncStorage
        const conversationsJSON = await AsyncStorage.getItem("conversations");
        let allConversations = conversationsJSON
          ? JSON.parse(conversationsJSON)
          : [];

        // Tìm cuộc trò chuyện
        const conversationIndex = allConversations.findIndex(
          (conv) => conv.conversationId === conversationId
        );

        if (conversationIndex === -1) {
          console.warn("Không tìm thấy cuộc trò chuyện:", conversationId);
          return [];
        }

        const conversation = allConversations[conversationIndex];
        const existingMessages = conversation.messages || [];

        // Sắp xếp tin nhắn mới theo createdAt (mới nhất trước)
        const sortedNewMessages = [...newMessages].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Hợp nhất tin nhắn mới và cũ
        let updatedMessages;
        if (position === "before") {
          updatedMessages = [...sortedNewMessages, ...existingMessages];
        } else {
          updatedMessages = [...existingMessages, ...sortedNewMessages];
        }

        // Loại bỏ trùng lặp dựa trên messageDetailId
        updatedMessages = Array.from(
          new Map(
            updatedMessages.map((msg) => [msg.messageDetailId, msg])
          ).values()
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Cập nhật conversation với messages và lastMessage
        const updatedConversation = {
          ...conversation,
          messages: updatedMessages,
          lastMessage:
            sortedNewMessages[0] ||
            updatedMessages[0] ||
            conversation.lastMessage,
        };

        allConversations[conversationIndex] = updatedConversation;

        // Sắp xếp lại conversations dựa trên lastMessage.createdAt
        allConversations = allConversations.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt)
            : new Date(0);
          const timeB = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt)
            : new Date(0);
          return timeB - timeA; // Mới nhất trước
        });

        // Lưu vào AsyncStorage với khóa tạm thời để tránh xung đột
        const tempKey = `conversations_temp_${Date.now()}`;
        await AsyncStorage.setItem(tempKey, JSON.stringify(allConversations));
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(allConversations)
        );
        await AsyncStorage.removeItem(tempKey); // Xóa khóa tạm

        // Cập nhật trạng thái conversations
        setConversations([...allConversations]);

        // console.log(
        //   `💾 Đã lưu ${newMessages.length} tin nhắn cho cuộc trò chuyện ${conversationId}`
        // );
        // console.log(
        //   "Danh sách tin nhắn sau khi lưu:",
        //   updatedMessages.map((msg) => msg.content)
        // );
        // console.log(
        //   "Cuộc trò chuyện được cập nhật, lastMessage:",
        //   updatedConversation.lastMessage?.content
        // );

        // Gọi callback
        if (onSaveComplete) {
          onSaveComplete(updatedMessages);
        }

        return updatedMessages;
      } catch (error) {
        console.error("Lỗi khi lưu tin nhắn:", error);
        return [];
      }
    },
    [setConversations]
  );

  const getMessages = async (conversationId) => {
    try {
      const conversationsJSON = await AsyncStorage.getItem("conversations");
      const conversations = conversationsJSON
        ? JSON.parse(conversationsJSON)
        : [];
      const conversation = conversations.find(
        (conv) => conv.conversationId === conversationId
      );
      return conversation?.messages || [];
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn từ AsyncStorage:", error);
      return [];
    }
  };

  const clearMessages = async (conversationId) => {
    try {
      const conversationsJSON = await AsyncStorage.getItem("conversations");
      const conversations = conversationsJSON
        ? JSON.parse(conversationsJSON)
        : [];
      const updated = conversations.map((conv) =>
        conv.conversationId === conversationId
          ? { ...conv, messages: [] }
          : conv
      );
      await AsyncStorage.setItem("conversations", JSON.stringify(updated));
      console.log(`🧹 Đã xóa tin nhắn cuộc trò chuyện ${conversationId}`);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
    }
  };

  const login = async (params) => {
    try {
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

      // Lấy danh sách cuộc trò chuyện
      const conversationsResponse = await api.conversations();
      if (conversationsResponse && conversationsResponse.data) {
        const filteredConversations = conversationsResponse.data
          .filter(
            (conversation) =>
              !conversation.formerMembers.includes(userId) &&
              !conversation.isDeleted &&
              (!conversation.isGroup ||
                conversation.groupMembers.includes(userId))
          )
          .map((conv) => ({ ...conv, messages: [] }));

        // Lấy tin nhắn cho từng cuộc trò chuyện
        const conversationsWithMessages = await Promise.all(
          filteredConversations.map(async (conv) => {
            try {
              const messagesResponse = await api.getAllMessages(
                conv.conversationId
              );
              if (messagesResponse && messagesResponse.messages) {
                const filteredMessages = messagesResponse.messages
                  .filter((m) => !m.hiddenFrom?.includes(userId))
                  .slice(0, 50);
                return { ...conv, messages: filteredMessages };
              }
              return conv;
            } catch (error) {
              console.error(
                `Lỗi khi lấy tin nhắn cho cuộc trò chuyện ${conv.conversationId}:`,
                error
              );
              return conv;
            }
          })
        );

        setConversations(conversationsWithMessages);
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(conversationsWithMessages)
        );

        console.log("Đã tải và lưu tin nhắn cho tất cả cuộc trò chuyện.");
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      throw error;
    }
  };

  const register = async (params) => {
    try {
      const response = await api.registerAccount(params);
      const { accessToken, refreshToken } = response.token;

      setaccessToken(accessToken);
      setRefreshToken(refreshToken);

      await getUserInfoById(response.user.userId);

      if (socket && response.user.userId) {
        socket.emit("authenticate", response.user.userId);
      }

      const conversationsResponse = await api.conversations();
      if (conversationsResponse && conversationsResponse.data) {
        const filteredConversations = conversationsResponse.data
          .filter(
            (conversation) =>
              !conversation.formerMembers.includes(response.user.userId) &&
              !conversation.isDeleted &&
              (!conversation.isGroup ||
                conversation.groupMembers.includes(response.user.userId))
          )
          .map((conv) => ({ ...conv, messages: [] }));

        const conversationsWithMessages = await Promise.all(
          filteredConversations.map(async (conv) => {
            try {
              const messagesResponse = await api.getAllMessages(
                conv.conversationId
              );
              if (messagesResponse && messagesResponse.messages) {
                const filteredMessages = messagesResponse.messages
                  .filter((m) => !m.hiddenFrom?.includes(response.user.userId))
                  .slice(0, 50);
                return { ...conv, messages: filteredMessages };
              }
              return conv;
            } catch (error) {
              console.error(
                `Lỗi khi lấy tin nhắn cho cuộc trò chuyện ${conv.conversationId}:`,
                error
              );
              return conv;
            }
          })
        );

        setConversations(conversationsWithMessages);
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(conversationsWithMessages)
        );
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearStorage();
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
        const filteredConversations = conversationsResponse.data
          .filter(
            (conversation) =>
              !conversation.formerMembers.includes(userInfo?.userId) &&
              !conversation.isDeleted &&
              (!conversation.isGroup ||
                conversation.groupMembers.includes(userInfo?.userId))
          )
          .map((conv) => ({
            ...conv,
            messages:
              conversations.find(
                (c) => c.conversationId === conv.conversationId
              )?.messages || [],
          }));

        setConversations(filteredConversations);
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(filteredConversations)
        );
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
        groupMember,
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
        addConversation,
        removeConversation,
        checkLastMessageDifference,
        updateGroupMembers,
        removeGroupMember,
        saveGroupMembers,
        changeRole,
        getMessages,
        saveMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
