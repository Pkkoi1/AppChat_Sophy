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
  const [pinnedConversations, setPinnedConversations] = useState([]);
  const [background, setBackground] = useState(null);
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [usersInDB, setUsersInDB] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupMember, setGroupMember] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);

  const socket = useContext(SocketContext);
  const flatListRef = useRef(null);

  useEffect(() => {
    clearStorage();
  }, []);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [token, refresh, user, storedBackground, convs, pinnedConvs] =
          await AsyncStorage.multiGet([
            "accessToken",
            "refreshToken",
            "userInfo",
            "background",
            "conversations",
            "pinnedConversations",
          ]);

        if (token[1] && refresh[1] && user[1]) {
          setaccessToken(token[1]);
          setRefreshToken(refresh[1]);
          setUserInfo(JSON.parse(user[1]));
        }

        if (storedBackground[1]) {
          setBackground(storedBackground[1]);
        }

        if (convs[1]) {
          setConversations(JSON.parse(convs[1]));
        }

        if (pinnedConvs[1]) {
          setPinnedConversations(JSON.parse(pinnedConvs[1]));
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
      const localConversation = [...conversations, ...pinnedConversations].find(
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

      const isPinned = userInfo?.pinnedConversations?.some(
        (pinned) => pinned.conversationId === conversationData.conversationId
      );

      if (isPinned) {
        const pinnedInfo = userInfo?.pinnedConversations.find(
          (pinned) => pinned.conversationId === conversationData.conversationId
        );
        const updatedPinned = Array.from(
          new Map(
            [
              {
                ...conversationData,
                messages: [],
                pinnedAt: pinnedInfo?.pinnedAt || new Date().toISOString(),
                isPinned: true,
              },
              ...pinnedConversations,
            ].map((conv) => [conv.conversationId, conv])
          ).values()
        ).sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));
        setPinnedConversations(updatedPinned);
        await AsyncStorage.setItem(
          "pinnedConversations",
          JSON.stringify(updatedPinned)
        );
        console.log(
          `Đã thêm cuộc trò chuyện ghim ${conversationData.conversationId} cục bộ.`
        );
      } else {
        const updatedConversations = Array.from(
          new Map(
            [{ ...conversationData, messages: [] }, ...conversations].map(
              (conv) => [conv.conversationId, conv]
            )
          ).values()
        ).sort((a, b) => {
          const timeA = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt)
            : new Date(0);
          const timeB = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt)
            : new Date(0);
          return timeB - timeA;
        });
        setConversations(updatedConversations);
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(updatedConversations)
        );
        console.log(
          `Đã thêm cuộc trò chuyện ${conversationData.conversationId} cục bộ.`
        );
      }

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

      const isPinned = pinnedConversations.some(
        (conv) => conv.conversationId === conversationId
      );

      if (isPinned) {
        const updatedPinned = pinnedConversations.filter(
          (conv) => conv.conversationId !== conversationId
        );
        setPinnedConversations(updatedPinned);
        await AsyncStorage.setItem(
          "pinnedConversations",
          JSON.stringify(updatedPinned)
        );
        console.log(`Đã xóa cuộc trò chuyện ghim ${conversationId} cục bộ.`);
      } else {
        const updatedConversations = conversations.filter(
          (conv) => conv.conversationId !== conversationId
        );
        setConversations(updatedConversations);
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(updatedConversations)
        );
        console.log(`Đã xóa cuộc trò chuyện ${conversationId} cục bộ.`);
      }

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

      const updateList = (list) =>
        list.map((conv) =>
          conv.conversationId === conversationId
            ? { ...conv, groupMembers: [...conv.groupMembers, ...newMembers] }
            : conv
        );

      setConversations(updateList);
      setPinnedConversations(updateList);

      setGroupMember((prevMembers) => [
        ...prevMembers,
        ...newMembers.filter(
          (newMember) =>
            !prevMembers.some((member) => member.id === newMember.id)
        ),
      ]);

      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
      );
      await AsyncStorage.setItem(
        "pinnedConversations",
        JSON.stringify(pinnedConversations)
      );

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

      const updateList = (list) =>
        list.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                groupMembers: conv.groupMembers.filter((id) => id !== memberId),
              }
            : conv
        );

      setConversations(updateList);
      setPinnedConversations(updateList);

      setGroupMember((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );

      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
      );
      await AsyncStorage.setItem(
        "pinnedConversations",
        JSON.stringify(pinnedConversations)
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
        const conversationsJSON = await AsyncStorage.getItem("conversations");
        const pinnedConversationsJSON = await AsyncStorage.getItem(
          "pinnedConversations"
        );
        let allConversations = conversationsJSON
          ? JSON.parse(conversationsJSON)
          : [];
        let allPinnedConversations = pinnedConversationsJSON
          ? JSON.parse(pinnedConversationsJSON)
          : [];

        const conversationIndex = allConversations.findIndex(
          (conv) => conv.conversationId === conversationId
        );
        const pinnedConversationIndex = allPinnedConversations.findIndex(
          (conv) => conv.conversationId === conversationId
        );

        let conversation;
        let isPinned = pinnedConversationIndex !== -1;

        if (isPinned) {
          conversation = allPinnedConversations[pinnedConversationIndex];
        } else if (conversationIndex !== -1) {
          conversation = allConversations[conversationIndex];
        } else {
          console.warn("Không tìm thấy cuộc trò chuyện:", conversationId);
          return [];
        }

        const existingMessages = conversation.messages || [];

        const sortedNewMessages = [...newMessages].sort(
          (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
        );

        let updatedMessages;
        if (position === "before") {
          updatedMessages = [...sortedNewMessages, ...existingMessages];
        } else {
          updatedMessages = [...existingMessages, ...sortedNewMessages];
        }

        updatedMessages = Array.from(
          new Map(
            updatedMessages.map((msg) => [msg?.messageDetailId, msg])
          ).values()
        ).sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

        const updatedConversation = {
          ...conversation,
          messages: updatedMessages,
          lastMessage:
            sortedNewMessages[0] ||
            updatedMessages[0] ||
            conversation.lastMessage,
          isPinned,
        };

        if (isPinned) {
          allPinnedConversations[pinnedConversationIndex] = updatedConversation;
        } else {
          allConversations[conversationIndex] = updatedConversation;
        }

        allConversations = allConversations.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt)
            : new Date(0);
          const timeB = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt)
            : new Date(0);
          return timeB - timeA;
        });

        allPinnedConversations = allPinnedConversations.sort((a, b) => {
          const timeA = a.pinnedAt ? new Date(a.pinnedAt) : new Date(0);
          const timeB = b.pinnedAt ? new Date(b.pinnedAt) : new Date(0);
          return timeB - timeA;
        });

        const tempKey = `conversations_temp_${Date.now()}`;
        await AsyncStorage.setItem(tempKey, JSON.stringify(allConversations));
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(allConversations)
        );
        await AsyncStorage.setItem(
          "pinnedConversations",
          JSON.stringify(allPinnedConversations)
        );
        await AsyncStorage.removeItem(tempKey);

        setConversations([...allConversations]);
        setPinnedConversations([...allPinnedConversations]);

        if (onSaveComplete) {
          onSaveComplete(updatedMessages);
        }

        return updatedMessages;
      } catch (error) {
        console.error("Lỗi khi lưu tin nhắn:", error);
        return [];
      }
    },
    [setConversations, setPinnedConversations]
  );

  const getMessages = async (conversationId) => {
    try {
      const conversationsJSON = await AsyncStorage.getItem("conversations");
      const pinnedConversationsJSON = await AsyncStorage.getItem(
        "pinnedConversations"
      );
      const conversations = conversationsJSON
        ? JSON.parse(conversationsJSON)
        : [];
      const pinnedConversations = pinnedConversationsJSON
        ? JSON.parse(pinnedConversationsJSON)
        : [];
      const conversation = [...conversations, ...pinnedConversations].find(
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
      const pinnedConversationsJSON = await AsyncStorage.getItem(
        "pinnedConversations"
      );
      let conversations = conversationsJSON
        ? JSON.parse(conversationsJSON)
        : [];
      let pinnedConversations = pinnedConversationsJSON
        ? JSON.parse(pinnedConversationsJSON)
        : [];

      conversations = conversations.map((conv) =>
        conv.conversationId === conversationId
          ? { ...conv, messages: [] }
          : conv
      );
      pinnedConversations = pinnedConversations.map((conv) =>
        conv.conversationId === conversationId
          ? { ...conv, messages: [] }
          : conv
      );

      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
      );
      await AsyncStorage.setItem(
        "pinnedConversations",
        JSON.stringify(pinnedConversations)
      );
      console.log(`🧹 Đã xóa tin nhắn cuộc trò chuyện ${conversationId}`);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
    }
  };

  const updatePinnedStatus = async (conversationId, shouldPin) => {
    try {
      // Update pinned status on the server
      if (shouldPin) {
        await api.pinConversation(conversationId);
      } else {
        await api.unPinConversation(conversationId);
      }

      // Update userInfo.pinnedConversations locally
      const updatedPinnedConversations = shouldPin
        ? [
            ...userInfo.pinnedConversations,
            { conversationId, pinnedAt: new Date().toISOString() },
          ]
        : userInfo.pinnedConversations.filter(
            (pinned) => pinned.conversationId !== conversationId
          );

      const updatedUserInfo = {
        ...userInfo,
        pinnedConversations: updatedPinnedConversations,
      };
      setUserInfo(updatedUserInfo);
      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      // Find the conversation in either pinnedConversations or conversations
      let conversation;
      const isCurrentlyPinned = pinnedConversations.some(
        (conv) => conv.conversationId === conversationId
      );

      if (isCurrentlyPinned) {
        conversation = pinnedConversations.find(
          (conv) => conv.conversationId === conversationId
        );
      } else {
        conversation = conversations.find(
          (conv) => conv.conversationId === conversationId
        );
      }

      if (!conversation) {
        throw new Error(
          "Không tìm thấy cuộc trò chuyện để cập nhật trạng thái ghim."
        );
      }

      // Update the lists based on the new pinned status
      if (shouldPin) {
        // Remove from conversations and add to pinnedConversations
        const updatedConversations = conversations.filter(
          (conv) => conv.conversationId !== conversationId
        );
        const updatedPinned = [
          {
            ...conversation,
            pinnedAt: new Date().toISOString(),
            isPinned: true,
          },
          ...pinnedConversations,
        ].sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));

        setConversations(updatedConversations);
        setPinnedConversations(updatedPinned);

        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(updatedConversations)
        );
        await AsyncStorage.setItem(
          "pinnedConversations",
          JSON.stringify(updatedPinned)
        );
      } else {
        // Remove from pinnedConversations and add to conversations
        const updatedPinned = pinnedConversations.filter(
          (conv) => conv.conversationId !== conversationId
        );
        const updatedConversations = [
          { ...conversation, isPinned: false },
          ...conversations,
        ].sort((a, b) => {
          const timeA = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt)
            : new Date(0);
          const timeB = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt)
            : new Date(0);
          return timeB - timeA;
        });

        setPinnedConversations(updatedPinned);
        setConversations(updatedConversations);

        await AsyncStorage.setItem(
          "pinnedConversations",
          JSON.stringify(updatedPinned)
        );
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(updatedConversations)
        );
      }

      console.log(
        `Đã ${
          shouldPin ? "ghim" : "bỏ ghim"
        } cuộc trò chuyện ${conversationId} cục bộ.`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái ghim:", error);
      throw error;
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

      const conversationsResponse = await api.conversations();
      if (conversationsResponse && conversationsResponse.data) {
        const pinnedIds =
          userInfo?.pinnedConversations?.map((p) => p.conversationId) || [];
        const filteredConversations = conversationsResponse.data
          .filter(
            (conversation) =>
              !conversation.formerMembers.includes(userId) &&
              !conversation.isDeleted &&
              (!conversation.isGroup ||
                conversation.groupMembers.includes(userId))
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

        const nonPinned = conversationsWithMessages
          .filter((conv) => !pinnedIds.includes(conv.conversationId))
          .sort((a, b) => {
            const timeA = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt)
              : new Date(0);
            const timeB = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt)
              : new Date(0);
            return timeB - timeA;
          });

        const pinned = conversationsWithMessages
          .filter((conv) => pinnedIds.includes(conv.conversationId))
          .map((conv) => {
            const pinnedInfo = userInfo?.pinnedConversations.find(
              (p) => p.conversationId === conv.conversationId
            );
            return {
              ...conv,
              pinnedAt: pinnedInfo?.pinnedAt || new Date().toISOString(),
            };
          })
          .sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));

        setConversations(nonPinned);
        setPinnedConversations(pinned);
        if (conversations && pinnedConversations) {
          handlerRefresh();
        }
        await AsyncStorage.setItem("conversations", JSON.stringify(nonPinned));
        await AsyncStorage.setItem(
          "pinnedConversations",
          JSON.stringify(pinned)
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
        const pinnedIds =
          userInfo?.pinnedConversations?.map((p) => p.conversationId) || [];
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

        const nonPinned = conversationsWithMessages
          .filter((conv) => !pinnedIds.includes(conv.conversationId))
          .sort((a, b) => {
            const timeA = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt)
              : new Date(0);
            const timeB = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt)
              : new Date(0);
            return timeB - timeA;
          });

        const pinned = conversationsWithMessages
          .filter((conv) => pinnedIds.includes(conv.conversationId))
          .map((conv) => {
            const pinnedInfo = userInfo?.pinnedConversations.find(
              (p) => p.conversationId === conv.conversationId
            );
            return {
              ...conv,
              pinnedAt: pinnedInfo?.pinnedAt || new Date().toISOString(),
            };
          })
          .sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));

        setConversations(nonPinned);
        setPinnedConversations(pinned);
        await AsyncStorage.setItem("conversations", JSON.stringify(nonPinned));
        await AsyncStorage.setItem(
          "pinnedConversations",
          JSON.stringify(pinned)
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
      setPinnedConversations([]);
      setBackground(null);
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "userInfo",
        "conversations",
        "pinnedConversations",
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
        const pinnedIds =
          userInfo?.pinnedConversations?.map((p) => p.conversationId) || [];
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
              [...conversations, ...pinnedConversations].find(
                (c) => c.conversationId === conv.conversationId
              )?.messages || [],
          }));

        const nonPinned = filteredConversations
          .filter((conv) => !pinnedIds.includes(conv.conversationId))
          .sort((a, b) => {
            const timeA = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt)
              : new Date(0);
            const timeB = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt)
              : new Date(0);
            return timeB - timeA;
          });

        const pinned = filteredConversations
          .filter((conv) => pinnedIds.includes(conv.conversationId))
          .map((conv) => {
            const pinnedInfo = userInfo?.pinnedConversations.find(
              (p) => p.conversationId === conv.conversationId
            );
            return {
              ...conv,
              pinnedAt: pinnedInfo?.pinnedAt || new Date().toISOString(),
            };
          })
          .sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));

        setConversations(nonPinned);
        setPinnedConversations(pinned);
        await AsyncStorage.setItem("conversations", JSON.stringify(nonPinned));
        await AsyncStorage.setItem(
          "pinnedConversations",
          JSON.stringify(pinned)
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

  const fetchFriends = useCallback(async () => {
    try {
      setFriendsLoading(true);
      setFriendsError(null);
      const response = await api.getFriends();
      setFriends(response || []);
      await AsyncStorage.setItem('friends', JSON.stringify(response));
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bạn bè:', error);
      setFriendsError('Không thể tải danh sách bạn bè.');
      try {
        // Lấy dữ liệu từ cache nếu có lỗi
        const cachedFriends = await AsyncStorage.getItem('friends');
        if (cachedFriends) {
          setFriends(JSON.parse(cachedFriends));
        }
      } catch (storageError) {
        console.error('Lỗi khi tải danh sách bạn bè từ cache:', storageError);
      }
      return [];
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  const updateFriendsList = useCallback(async (newFriend = null, removedFriendId = null) => {
    try {
      if (newFriend) {
        // Thêm bạn mới
        const updatedFriends = [...friends, newFriend];
        setFriends(updatedFriends);
        await AsyncStorage.setItem('friends', JSON.stringify(updatedFriends));
      } else if (removedFriendId) {
        // Xóa bạn
        const updatedFriends = friends.filter(friend => friend._id !== removedFriendId);
        setFriends(updatedFriends);
        await AsyncStorage.setItem('friends', JSON.stringify(updatedFriends));
      } else {
        // Cập nhật toàn bộ danh sách
        await fetchFriends();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật danh sách bạn bè:', error);
    }
  }, [friends, fetchFriends]);

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
    if (
      socket &&
      (conversations.length > 0 || pinnedConversations.length > 0) &&
      userInfo?.userId
    ) {
      const allIds = [...conversations, ...pinnedConversations].map(
        (conv) => conv.conversationId
      );
      socket.emit("joinUserConversations", allIds);
      console.log("📡 Đã join tất cả conversations:", allIds);
    }
  }, [socket, conversations, pinnedConversations, userInfo?.userId]);

  useEffect(() => {
    if (userInfo?.userId) {
      fetchFriends();
    }
  }, [userInfo, fetchFriends]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        userInfo,
        isLoading,
        conversations,
        pinnedConversations,
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
        updatePinnedStatus, // Add new function to context
        friends,
        friendsLoading,
        friendsError,
        fetchFriends,
        updateFriendsList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
