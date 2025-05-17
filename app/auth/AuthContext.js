import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../socket/SocketContext";
import * as Contacts from "expo-contacts";
import { Alert, Linking } from "react-native";
import { fetchName } from "../components/getUserInfo/UserName";
import { setupAuthSocketEvents } from "../socket/socketEvents/AuthSocketEvents";
import { pickExternalDirectory } from "@/app/storage/StorageService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
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
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);

  const socket = useContext(SocketContext);
  const flatListRef = useRef(null);
  const joinedConversationIds = useRef(new Set());

  useEffect(() => {
    clearStorage();
  }, []);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [token, refresh, user, storedBackground, convs] =
          await AsyncStorage.multiGet([
            "accessToken",
            "refreshToken",
            "userInfo",
            "background",
            "conversations",
          ]);

        if (token[1] && refresh[1] && user[1]) {
          setAccessToken(token[1]);
          setRefreshToken(refresh[1]);
          setUserInfo(JSON.parse(user[1]));
        }

        if (storedBackground[1]) {
          setBackground(storedBackground[1]);
        }

        if (convs[1]) {
          setConversations(JSON.parse(convs[1]));
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
    if (userInfo?.userId) {
      fetchFriends();
    }
  }, [userInfo, fetchFriends]);

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

    const handleAvatarChange = ({ conversationId, newAvatar }) => {
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                groupAvatarUrl: newAvatar,
                unreadCount: [],
                lastMessage: {
                  ...conv.lastMessage,
                  content: "Ảnh nhóm đã thay đổi",
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log(`Đã cập nhật avatar cho cuộc trò chuyện ${conversationId}.`);
    };

    const handleNewGroupName = ({ conversationId, newName }) => {
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                groupName: newName,
                unreadCount: [],
                lastMessage: {
                  ...conv.lastMessage,
                  content: "Tên nhóm đã thay đổi",
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log("Đã đổi tên nhóm");
    };

    const handleNewMemberJoined = async ({ conversationId, userId }) => {
      const userName = await fetchName(userId);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                unreadCount: [],
                groupMembers: [...conv.groupMembers, userId],
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${userName} vừa vào nhóm`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log(`User ${userName} đã vào nhóm ${conversationId}`);
    };

    const handleUserAdded = async ({
      conversationId,
      addedUser,
      addedByUser,
    }) => {
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                unreadCount: [],
                groupMembers: [...conv.groupMembers, addedUser.userId],
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${addedByUser.fullname} đã thêm ${addedUser.fullname} vào nhóm`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log(
        `User ${addedUser.fullname} đã được thêm vào nhóm ${conversationId}`
      );
    };

    const handleMemberLeft = async ({ conversationId, userId }) => {
      const userName = await fetchName(userId);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                unreadCount: [],
                groupMembers: conv.groupMembers.filter((id) => id !== userId),
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${userName} đã rời nhóm`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log(`User ${userName} đã rời nhóm ${conversationId}`);
    };

    const handleMemberRemoved = async ({
      conversationId,
      kickedUser,
      kickedByUser,
    }) => {
      if (kickedUser.userId === userInfo?.userId) {
        console.log("Bạn đã bị xóa khỏi nhóm. Xóa cuộc trò chuyện...");
        setConversations((prevConversations) =>
          prevConversations.filter(
            (conv) => conv.conversationId !== conversationId
          )
        );
      } else {
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.conversationId === conversationId
              ? {
                  ...conv,
                  unreadCount: [],
                  groupMembers: conv.groupMembers.filter(
                    (id) => id !== kickedUser.userId
                  ),
                  lastMessage: {
                    ...conv.lastMessage,
                    content: `${kickedUser.fullname} đã bị ${kickedByUser.fullname} xóa khỏi nhóm`,
                    senderId: null,
                    createdAt: new Date().toISOString(),
                  },
                }
              : conv
          )
        );
      }
    };

    const handleUserBlocked = async ({ conversationId, blockedUserId }) => {
      if (blockedUserId === userInfo?.userId) {
        console.log("Bạn đã bị chặn khỏi nhóm. Xóa cuộc trò chuyện...");
        setConversations((prevConversations) =>
          prevConversations.filter(
            (conv) => conv.conversationId !== conversationId
          )
        );
      } else {
        const userName = await fetchName(blockedUserId);
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.conversationId === conversationId
              ? {
                  ...conv,
                  blocked: [...conv.blocked, blockedUserId],
                  lastMessage: {
                    ...conv.lastMessage,
                    content: `${userName} đã bị chặn khỏi nhóm`,
                    senderId: null,
                    createdAt: new Date().toISOString(),
                  },
                }
              : conv
          )
        );
      }
    };

    const handleOwnerChange = async ({ conversationId, newOwner }) => {
      const userName = await fetchName(newOwner);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                unreadCount: [],
                rules: {
                  ...conv.rules,
                  ownerId: newOwner,
                },
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${userName} đang là nhóm trưởng`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log(
        `Nhóm trưởng đã được truyền lại cho user ${newOwner} trong nhóm ${conversationId}`
      );
    };

    const handleAddCoOwner = async ({ conversationId, newCoOwnerIds }) => {
      const userName = await fetchName(newCoOwnerIds);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                unreadCount: [],
                rules: {
                  ...conv.rules,
                  coOwnerIds: [...conv.rules.coOwnerIds, ...newCoOwnerIds],
                },
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${userName} đã làm nhóm phó`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log(
        `Nhóm phó đã được thêm: ${newCoOwnerIds.join(
          ", "
        )} trong nhóm ${conversationId}`
      );
    };

    const handleRemoveCoOwner = async ({ conversationId, removedCoOwner }) => {
      const userName = await fetchName(removedCoOwner);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                unreadCount: [],
                rules: {
                  ...conv.rules,
                  coOwnerIds: conv.rules.coOwnerIds.filter(
                    (id) => !removedCoOwner.includes(id)
                  ),
                },
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${userName} đã không còn là nhóm phó`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log(
        `Nhóm phó đã bị loại bỏ: ${removedCoOwner.join(
          ", "
        )} trong nhóm ${conversationId}`
      );
    };

    const handleGroupDeleted = ({ conversationId }) => {
      setConversations((prevConversations) =>
        prevConversations.filter(
          (conv) => conv.conversationId !== conversationId
        )
      );
      console.log(`Nhóm ${conversationId} đã bị xóa`);
    };

    const handleUserUnblocked = async ({ conversationId, unblockedUserId }) => {
      const userName = await fetchName(unblockedUserId);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                blocked: conv.blocked.filter((id) => id !== unblockedUserId),
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${userName} đã được gỡ chặn khỏi nhóm`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
      console.log(
        `User ${userName} đã được bỏ chặn trong nhóm ${conversationId}`
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newConversation", handleNewConversation);
    socket.on("groupAvatarChanged", handleAvatarChange);
    socket.on("groupNameChanged", handleNewGroupName);
    socket.on("userJoinedGroup", handleNewMemberJoined);
    socket.on("userAddedToGroup", handleUserAdded);
    socket.on("userLeftGroup", handleMemberLeft);
    socket.on("userRemovedFromGroup", handleMemberRemoved);
    socket.on("groupOwnerChanged", handleOwnerChange);
    socket.on("groupCoOwnerAdded", handleAddCoOwner);
    socket.on("groupCoOwnerRemoved", handleRemoveCoOwner);
    socket.on("groupDeleted", handleGroupDeleted);
    socket.on("userBlocked", handleUserBlocked);
    socket.on("userUnblocked", handleUserUnblocked);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newConversation", handleNewConversation);
      socket.off("groupAvatarChanged", handleAvatarChange);
      socket.off("groupNameChanged", handleNewGroupName);
      socket.off("userJoinedGroup", handleNewMemberJoined);
      socket.off("userAddedToGroup", handleUserAdded);
      socket.off("userRemovedFromGroup", handleMemberRemoved);
      socket.off("userLeftGroup", handleMemberLeft);
      socket.off("groupOwnerChanged", handleOwnerChange);
      socket.off("groupCoOwnerAdded", handleAddCoOwner);
      socket.off("groupCoOwnerRemoved", handleRemoveCoOwner);
      socket.off("groupDeleted", handleGroupDeleted);
      socket.off("userBlocked", handleUserBlocked);
      socket.off("userUnblocked", handleUserUnblocked);
    };
  }, [socket, addConversation]);

  const clearStorage = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      console.log("Đã xóa sạch dữ liệu AsyncStorage");
    } catch (e) {
      console.error("Lỗi khi xóa AsyncStorage:", e);
    }
  }, []);

  const checkLastMessageDifference = useCallback(
    async (conversationId) => {
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
    },
    [conversations, userInfo?.userId]
  );

  const addConversation = useCallback(async (conversationData) => {
    try {
      if (!conversationData.conversationId) {
        throw new Error("Thiếu conversationId.");
      }

      setConversations((prev) => {
        const updatedConversations = Array.from(
          new Map(
            [{ ...conversationData, messages: [] }, ...prev].map((conv) => [
              conv.conversationId,
              conv,
            ])
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
        AsyncStorage.setItem(
          "conversations",
          JSON.stringify(updatedConversations)
        );
        console.log(
          `Đã thêm cuộc trò chuyện ${conversationData.conversationId} cục bộ.`
        );
        return updatedConversations;
      });

      return conversationData;
    } catch (error) {
      console.error("Lỗi khi thêm cuộc trò chuyện:", error);
      throw error;
    }
  }, []);

  const removeConversation = useCallback(
    async (conversationId) => {
      try {
        const { isDifferent } = await checkLastMessageDifference(
          conversationId
        );
        if (isDifferent) {
          console.warn(
            "Tin nhắn cuối không đồng bộ trước khi xóa cuộc trò chuyện."
          );
          await handlerRefresh();
        }

        setConversations((prev) => {
          const updatedConversations = prev.filter(
            (conv) => conv.conversationId !== conversationId
          );
          AsyncStorage.setItem(
            "conversations",
            JSON.stringify(updatedConversations)
          );
          console.log(`Đã xóa cuộc trò chuyện ${conversationId} cục bộ.`);
          return updatedConversations;
        });

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
        throw error;
      }
    },
    [
      checkLastMessageDifference,
      handlerRefresh,
      conversations,
      socket,
      userInfo?.userId,
    ]
  );

  const updateGroupMembers = useCallback(async (conversationId, newMembers) => {
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

      setConversations((prev) => {
        const updated = updateList(prev);
        AsyncStorage.setItem("conversations", JSON.stringify(updated));
        return updated;
      });

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
  }, []);

  const changeRole = useCallback(async (conversationId, memberId, newRole) => {
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
        `Đã thay đổi vai trò của thành viên ${memberId} thành ${newRole} trong nhóm ${conversationId}.`
      );
    } catch (error) {
      console.error("Lỗi khi thay đổi vai trò thành viên:", error);
      throw error;
    }
  }, []);

  const removeGroupMember = useCallback(async (conversationId, memberId) => {
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

      setConversations((prev) => {
        const updated = updateList(prev);
        AsyncStorage.setItem("conversations", JSON.stringify(updated));
        return updated;
      });

      setGroupMember((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );

      console.log(`Đã xóa thành viên ${memberId} khỏi nhóm ${conversationId}.`);
    } catch (error) {
      console.error("Lỗi khi xóa thành viên nhóm:", error);
      throw error;
    }
  }, []);

  const saveMessages = useCallback(
    async (
      conversationId,
      newMessages,
      position = "before",
      onSaveComplete
    ) => {
      try {
        const conversationsJSON = await AsyncStorage.getItem("conversations");
        let allConversations = conversationsJSON
          ? JSON.parse(conversationsJSON)
          : [];

        const conversationIndex = allConversations.findIndex(
          (conv) => conv.conversationId === conversationId
        );

        let conversation;
        if (conversationIndex !== -1) {
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
        ).sort(
          (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
        );

        const updatedConversation = {
          ...conversation,
          messages: updatedMessages,
          lastMessage:
            sortedNewMessages[0] ||
            updatedMessages[0] ||
            conversation.lastMessage,
        };

        allConversations[conversationIndex] = updatedConversation;

        allConversations = allConversations.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt)
            : new Date(0);
          const timeB = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt)
            : new Date(0);
          return timeB - timeA;
        });

        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(allConversations)
        );

        // Update state with the latest conversation data
        setConversations((prev) => {
          const prevIds = prev.map((c) => c.conversationId);
          const newIds = allConversations.map((c) => c.conversationId);
          if (JSON.stringify(prevIds) === JSON.stringify(newIds)) {
            return allConversations;
          }
          return [...allConversations];
        });

        if (onSaveComplete) {
          onSaveComplete(updatedMessages);
        }

        return updatedMessages;
      } catch (error) {
        console.error("Lỗi khi lưu tin nhắn:", error);
        return [];
      }
    },
    []
  );

  const getMessages = useCallback(async (conversationId) => {
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
  }, []);

  const clearMessages = useCallback(async (conversationId) => {
    try {
      const conversationsJSON = await AsyncStorage.getItem("conversations");
      let conversations = conversationsJSON
        ? JSON.parse(conversationsJSON)
        : [];

      conversations = conversations.map((conv) =>
        conv.conversationId === conversationId
          ? { ...conv, messages: [] }
          : conv
      );

      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
      );

      setConversations((prev) => {
        const updated = conversations.filter((c) =>
          prev.some((p) => p.conversationId === c.conversationId)
        );
        return updated.length === prev.length ? prev : updated;
      });

      console.log(`🧹 Đã xóa tin nhắn cuộc trò chuyện ${conversationId}`);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
    }
  }, []);

  const login = useCallback(
    async (params) => {
      try {
        const response = await api.login(params);
        const { accessToken, refreshToken } = response.data.token;
        const userId = response.data.user.userId;

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        await AsyncStorage.setItem("userId", userId);
        await getUserInfoById(userId);

        // Yêu cầu chọn thư mục lưu trữ
        try {
          await pickExternalDirectory();
        } catch (err) {
          Alert.alert(
            "Chọn thư mục lưu trữ",
            "Bạn cần chọn thư mục lưu trữ để tiếp tục sử dụng ứng dụng."
          );
          throw err;
        }

        if (socket && socket.connected) {
          socket.emit("authenticate", userId);
        }

        await handlerRefresh();
      } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        if (error.response?.status === 401) {
          throw new Error("Sai số điện thoại hoặc mật khẩu.");
        } else if (error.response?.status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else {
          throw new Error("Đã xảy ra lỗi. Vui lòng kiểm tra kết nối mạng.");
        }
      }
    },
    [getUserInfoById, handlerRefresh, socket]
  );

  const register = useCallback(
    async (params) => {
      try {
        const response = await api.registerAccount(params);
        const { accessToken, refreshToken } = response.token;

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        await getUserInfoById(response.user.userId);

        // Yêu cầu chọn thư mục lưu trữ
        try {
          await pickExternalDirectory();
        } catch (err) {
          Alert.alert(
            "Chọn thư mục lưu trữ",
            "Bạn cần chọn thư mục lưu trữ để tiếp tục sử dụng ứng dụng."
          );
          throw err;
        }

        if (socket && socket.connected) {
          socket.emit("authenticate", response.user.userId);
        }

        await handlerRefresh();
      } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        throw error;
      }
    },
    [getUserInfoById, handlerRefresh, socket]
  );

  const logout = useCallback(async () => {
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
  }, [clearStorage]);

  const getUserInfoById = useCallback(async (id) => {
    try {
      const res = await api.getUserById(id);
      setUserInfo(res.data);
      await AsyncStorage.setItem("userInfo", JSON.stringify(res.data));
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }, []);

  const updateUserInfo = useCallback(
    async (newInfo) => {
      const updated = { ...userInfo, ...newInfo };
      setUserInfo(updated);
      await AsyncStorage.setItem("userInfo", JSON.stringify(updated));
    },
    [userInfo]
  );

  const handlerRefresh = useCallback(async () => {
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
          }))
          .sort((a, b) => {
            const timeA = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt)
              : new Date(0);
            const timeB = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt)
              : new Date(0);
            return timeB - timeA;
          });

        setConversations((prev) => {
          const prevIds = prev.map((c) => c.conversationId);
          const newIds = filteredConversations.map((c) => c.conversationId);
          if (JSON.stringify(prevIds) === JSON.stringify(newIds)) {
            return prev;
          }
          AsyncStorage.setItem(
            "conversations",
            JSON.stringify(filteredConversations)
          );
          return filteredConversations;
        });
      }
      await fetchGroups();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [userInfo?.userId, fetchGroups, conversations]);

  const updateBackground = useCallback(async (newBackground) => {
    setBackground(newBackground);
    await AsyncStorage.setItem("background", newBackground);
  }, []);

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
      await AsyncStorage.setItem("friends", JSON.stringify(response));
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
      setFriendsError("Không thể tải danh sách bạn bè.");
      try {
        const cachedFriends = await AsyncStorage.getItem("friends");
        if (cachedFriends) {
          setFriends(JSON.parse(cachedFriends));
        }
      } catch (storageError) {
        console.error("Lỗi khi tải danh sách bạn bè từ cache:", storageError);
      }
      return [];
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  const updateFriendsList = useCallback(
    async (newFriend = null, removedFriendId = null) => {
      try {
        if (newFriend) {
          setFriends((prev) => {
            const updatedFriends = [...prev, newFriend];
            AsyncStorage.setItem("friends", JSON.stringify(updatedFriends));
            return updatedFriends;
          });
        } else if (removedFriendId) {
          setFriends((prev) => {
            const updatedFriends = prev.filter(
              (friend) => friend._id !== removedFriendId
            );
            AsyncStorage.setItem("friends", JSON.stringify(updatedFriends));
            return updatedFriends;
          });
        } else {
          await fetchFriends();
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật danh sách bạn bè:", error);
      }
    },
    [fetchFriends]
  );

  // Đảm bảo log này chạy mỗi khi conversations hoặc userInfo.userId thay đổi
  useEffect(() => {
    if (userInfo?.userId) {
      console.log("🧩 Đã khởi tạo AuthContext");
      console.log("Số lượng cuộc trò chuyện:", conversations.length);
      if (socket && conversations.length > 0) {
        const allIds = conversations.map((conv) => conv.conversationId);
        socket.emit("joinUserConversations", allIds);
        console.log("📡 Đã join tất cả conversations:", JSON.stringify(allIds));
      }
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
