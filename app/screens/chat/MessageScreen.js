import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Alert,
} from "react-native";
import ChatHeader from "./header/ChatHeader";
import SearchHeader from "./optional/name/searchMessage/SearchHeader";
import SearchFooter from "./optional/name/searchMessage/SearchFooter";
import ChatFooter from "./footer/ChatFooter";
import Conversation from "./message/Conversation";
import MessageScreenStyle from "./MessageScreenStyle";
import Fuse from "fuse.js";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { SocketContext } from "@/app/socket/SocketContext";
import { cleanupNewMessage, handleNewMessage } from "@/app/socket/SocketEvent";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import {
  getMessages as getMessagesFromStorage,
  saveMessages,
  appendMessage,
} from "@/app/storage/StorageService";

// --- Tách các handler socket event ra ngoài useEffect ---
const useMessageSocketEvents = ({
  socket,
  conversation,
  userInfo,
  handlerRefresh,
  setMessages,
  saveGroupMembers,
  groupMember,
  changeRole,
  navigation,
}) => {
  // Định nghĩa các hàm handler giống logic cũ, KHÔNG đổi logic
  const handleNewMessage = async ({ conversationId, message, sender }) => {
    console.log("Nhận tin nhắn mới qua socket:", message.content);
    if (conversationId === conversation.conversationId) {
      console.log(
        "Đã nhận tin nhắn mới trong cuộc trò chuyện 1:",
        conversationId,
        message.content
      );
      // Mark the message as read
      api.readMessage(conversationId);
      if (
        conversationId === conversation.conversationId &&
        message?.senderId !== userInfo?.userId
      ) {
        setMessages((prevMessages) => [message, ...prevMessages]);
      }
    }
  };

  const handleNewConversation = async () => {
    console.log("New conversation received. Refreshing conversations...");
    await handlerRefresh();
  };

  const handleMessageRecalled = ({ conversationId, messageId }) => {
    if (conversationId === conversation.conversationId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageDetailId === messageId ? { ...msg, isRecall: true } : msg
        )
      );
      import("@/app/storage/StorageService").then(({ editMessage }) => {
        editMessage(conversationId, messageId, "recall");
      });
    }
    console.log(
      "Nhận tin nhắn đã thu hồi qua socket:",
      conversationId,
      messageId
    );
  };

  const handleMessagePinned = ({ conversationId, messageId }) => {
    if (conversationId === conversation.conversationId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageDetailId === messageId
            ? { ...msg, isPinned: true, pinnedAt: new Date() }
            : msg
        )
      );
    }
    console.log("Nhận tin nhắn đã ghim qua socket:", conversationId, messageId);
  };

  const handleMessageUnpinned = ({ conversationId, messageId }) => {
    if (conversationId === conversation.conversationId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageDetailId === messageId
            ? { ...msg, isPinned: false, pinnedAt: null }
            : msg
        )
      );
    }
    console.log(
      "Nhận tin nhắn đã bỏ ghim qua socket:",
      conversationId,
      messageId
    );
  };

  const handleGroupAvatarChanged = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "avatarChange",
          actorId: userInfo?.userId,
          targetIds: [],
          content: "Hình nền nhóm đã được thay đổi.",
        },
        content: "Hình nền nhóm đã được thay đổi.",
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };

      setMessages((prev) => [pseudoMessage, ...prev]);
      conversation.groupAvatarUrl = data.newAvatar;
    }
  };

  const handleGroupNameChanged = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "nameChange",
          actorId: userInfo?.userId,
          targetIds: [],
          content: `Tên nhóm đã được đổi thành "${data.newName}".`,
        },
        content: `Tên nhóm đã được đổi thành "${data.newName}".`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };

      setMessages((prev) => [pseudoMessage, ...prev]);
    }
  };

  const handleUserAddedToGroup = async (data) => {
    console.log("User added to group event received:", data);
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "userAdded",
          actorId: data.addedByUser,
          targetIds: [data.addedUser],
          content: `Một thành viên mới đã được thêm vào nhóm.`,
        },
        content: `Một thành viên mới đã được thêm vào nhóm.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);

      const newMemberInfo = await fetchUserInfo(data.addedUser.userId);
      if (newMemberInfo) {
        const newMember = {
          id: data.addedUser.userId,
          role: "member",
          fullName: newMemberInfo.fullname,
          urlAvatar: newMemberInfo.urlavatar,
        };
        saveGroupMembers(conversation.conversationId, [
          ...groupMember,
          newMember,
        ]);
        console.log("User added to group:", newMember);
      }
    }
  };

  const handleUserLeftGroup = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "userLeft",
          actorId: data.userId,
          targetIds: [],
          content: `Một thành viên đã rời nhóm.`,
        },
        content: `Một thành viên đã rời nhóm.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);

      const updatedGroupMembers = groupMember.filter(
        (member) => member.id !== data.userId
      );
      saveGroupMembers(conversation.conversationId, updatedGroupMembers);

      console.log(`User ${data.userId} đã rời nhóm ${data.conversationId}`);
    }
  };

  const handleUserRemovedFromGroup = (data) => {
    if (data.conversationId === conversation.conversationId) {
      if (data.kickedUser.userId === userInfo.userId) {
        handlerRefresh();
        Alert.alert(
          "Bạn đã bị xóa khỏi nhóm. Đang điều hướng về trang chính..."
        );
        navigation.navigate("Home");
      } else {
        const pseudoMessage = {
          _id: `temp_${Date.now()}`,
          messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
          conversationId: data.conversationId,
          type: "notification",
          notification: {
            type: "userRemoved",
            actorId: data.kickedByUser,
            targetIds: [data.kickedUser],
            content: `Một thành viên đã bị xóa khỏi nhóm.`,
          },
          content: `Một thành viên đã bị xóa khỏi nhóm.`,
          createdAt: new Date().toISOString(),
          senderId: null,
          sendStatus: "sent",
        };
        setMessages((prev) => [pseudoMessage, ...prev]);

        const updatedGroupMembers = groupMember.filter(
          (member) => member.id !== data.kickedUser.userId
        );
        saveGroupMembers(conversation.conversationId, updatedGroupMembers);
        console.log(
          `User ${data.kickedUser.userId} đã bị xóa khỏi nhóm ${data.conversationId}`
        );
      }
    }
  };

  const handleGroupOwnerChanged = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "ownerChange",
          actorId: data.newOwner,
          targetIds: [],
          content: `Nhóm trưởng đã được truyền lại.`,
        },
        content: `Nhóm trưởng đã được truyền lại.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);
      changeRole(conversation.conversationId, data.newOwner, "owner");
      console.log(
        `Nhóm trưởng đã được truyền lại cho user ${data.newOwner} trong nhóm ${data.conversationId}`
      );
    }
  };

  const handleGroupCoOwnerAdded = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "coOwnerAdded",
          actorId: null,
          targetIds: data.newCoOwnerIds,
          content: `Nhóm phó đã được thêm.`,
        },
        content: `Nhóm phó đã được thêm.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);
      changeRole(
        conversation.conversationId,
        data.newCoOwnerIds.join(", "),
        "co-owner"
      );
      console.log(
        `Nhóm phó đã được thêm: ${data.newCoOwnerIds.join(", ")} trong nhóm ${
          data.conversationId
        }`
      );
    }
  };

  const handleUserUnblocked = async (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "userAdded",
          targetIds: [data.unblockedUserId],
          content: `Một thành viên mới đã được thêm vào nhóm.`,
        },
        content: `Một thành viên mới đã được thêm vào nhóm.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);

      const unblockedUserInfo = await fetchUserInfo(data.unblockedUserId);
      if (unblockedUserInfo) {
        const unblockedMember = {
          id: data.unblockedUserId,
          role: "member",
          fullName: unblockedUserInfo.fullname,
          urlAvatar: unblockedUserInfo.urlavatar,
        };
        console.log("User unblocked and added to group:", unblockedMember);
      }
    }
  };

  const handleGroupCoOwnerRemoved = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "coOwnerRemoved",
          actorId: null,
          targetIds: data.removedCoOwnerIds,
          content: `Nhóm phó đã bị loại bỏ.`,
        },
        content: `Nhóm phó đã bị loại bỏ.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);
      changeRole(conversation.conversationId, data.removedCoOwner, "member");
      console.log(
        `Nhóm phó đã bị loại bỏ: ${data.removedCoOwnerIds.join(
          ", "
        )} trong nhóm ${data.conversationId}`
      );
    }
  };

  const handleGroupDeleted = () => {
    handlerRefresh();
    Alert.alert("Nhóm đã bị xóa. Đang điều hướng về trang chính...");
    navigation.navigate("Home");
  };

  const handleUserBlocked = (data) => {
    console.log("User blocked event received:", data);
    if (data.conversationId === conversation.conversationId) {
      if (data.blockedUserId === userInfo.userId) {
        handlerRefresh();
        Alert.alert(
          "Bạn đã bị chặn khỏi nhóm. Đang điều hướng về trang chính..."
        );
        navigation.navigate("Home");
      } else {
        const pseudoMessage = {
          _id: `temp_${Date.now()}`,
          messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
          conversationId: data.conversationId,
          type: "notification",
          notification: {
            type: "userBlocked",
            actorId: null,
            targetIds: [data.blockedUserId],
            content: `Một thành viên đã bị chặn.`,
          },
          content: `Một thành viên đã bị chặn.`,
          createdAt: new Date().toISOString(),
          senderId: null,
          sendStatus: "sent",
        };
        setMessages((prev) => [pseudoMessage, ...prev]);

        const updatedGroupMembers = groupMember.filter(
          (member) => member.id !== data.blockedUserId
        );
        saveGroupMembers(conversation.conversationId, updatedGroupMembers);
        console.log(
          `User ${data.blockedUserId} đã bị chặn trong nhóm ${data.conversationId}`
        );
      }
    }
  };

  // Đăng ký và cleanup các sự kiện socket
  useEffect(() => {
    if (!socket || !conversation?.conversationId) {
      // Nếu socket hoặc conversationId không hợp lệ, không đăng ký gì cả
      console.warn(
        "Không thể đăng ký socket events: socket hoặc conversationId không hợp lệ."
      );
      return;
    }
    // Đăng ký lại mỗi khi socket hoặc conversationId thay đổi
    socket.emit("joinUserConversations", [conversation.conversationId]);

    // Đăng ký các sự kiện, cleanup đúng cách
    socket.on("newMessage", handleNewMessage);
    socket.on("newConversation", handleNewConversation);
    socket.on("messageRecalled", handleMessageRecalled);
    socket.on("messagePinned", handleMessagePinned);
    socket.on("messageUnpinned", handleMessageUnpinned);
    socket.on("groupAvatarChanged", handleGroupAvatarChanged);
    socket.on("groupNameChanged", handleGroupNameChanged);
    socket.on("userAddedToGroup", handleUserAddedToGroup);
    socket.on("userLeftGroup", handleUserLeftGroup);
    socket.on("userRemovedFromGroup", handleUserRemovedFromGroup);
    socket.on("groupOwnerChanged", handleGroupOwnerChanged);
    socket.on("groupCoOwnerAdded", handleGroupCoOwnerAdded);
    socket.on("userUnblocked", handleUserUnblocked);
    socket.on("groupCoOwnerRemoved", handleGroupCoOwnerRemoved);
    socket.on("groupDeleted", handleGroupDeleted);
    socket.on("userBlocked", handleUserBlocked);

    // Cleanup: chỉ off các handler này, không off toàn bộ event (nếu off toàn bộ sẽ mất listener ở các màn khác)
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newConversation", handleNewConversation);
      socket.off("messageRecalled", handleMessageRecalled);
      socket.off("messagePinned", handleMessagePinned);
      socket.off("messageUnpinned", handleMessageUnpinned);
      socket.off("groupAvatarChanged", handleGroupAvatarChanged);
      socket.off("groupNameChanged", handleGroupNameChanged);
      socket.off("userAddedToGroup", handleUserAddedToGroup);
      socket.off("userLeftGroup", handleUserLeftGroup);
      socket.off("userRemovedFromGroup", handleUserRemovedFromGroup);
      socket.off("groupOwnerChanged", handleGroupOwnerChanged);
      socket.off("groupCoOwnerAdded", handleGroupCoOwnerAdded);
      socket.off("userUnblocked", handleUserUnblocked);
      socket.off("groupCoOwnerRemoved", handleGroupCoOwnerRemoved);
      socket.off("groupDeleted", handleGroupDeleted);
      socket.off("userBlocked", handleUserBlocked);
    };
  }, [
    socket,
    conversation?.conversationId,
    userInfo?.userId,
    handlerRefresh,
    setMessages,
    saveGroupMembers,
    groupMember,
    changeRole,
    navigation,
  ]);
};

const MessageScreen = ({ route, navigation }) => {
  const {
    userInfo,
    handlerRefresh,
    background,
    groupMember,
    saveGroupMembers,
    changeRole,
    conversations,
    setIsMessageScreenActive,
  } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const { conversation, startSearch, receiver } = route.params;
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(startSearch || false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [highlightedMessageIds, setHighlightedMessageIds] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const [sended, setSended] = useState(false);
  const [effectiveBackground, setEffectiveBackground] = useState(
    background || conversation?.background || null
  );

  // Theo dõi background thay đổi để cập nhật lại hiệu ứng nền
  useEffect(() => {
    setEffectiveBackground(background || conversation?.background || null);
  }, [background, conversation?.background]);

  const calculateLastActive = (lastActive) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));

    if (diffInMinutes < 2) return "Đang hoạt động";
    if (diffInMinutes < 60) return `Truy cập ${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `Truy cập ${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `Truy cập ${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };
  // Lưu tin nhắn vào StorageService khi thoát màn hình
  const lastSavedConversationId = useRef();
  useEffect(() => {
    lastSavedConversationId.current = conversation?.conversationId;
    // Chỉ theo dõi conversationId và userId để tránh lặp vô hạn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.conversationId, userInfo?.userId]);

  useEffect(() => {
    console.log(
      "🏗️ MessageScreen mounted for conversation:",
      conversation?.conversationId
    );
    return () => {
      // Chỉ lưu khi thực sự unmount conversationId hiện tại
      if (
        lastSavedConversationId.current &&
        conversation?.conversationId === lastSavedConversationId.current
      ) {
        console.log(
          `📡 Đã thoát giao diện chat: ${
            conversation?.conversationId || "undefined"
          }`
        );
        console.log("🏚️ MessageScreen unmounted");
        api
          .getAllMessages(conversation.conversationId)
          .then((response) => {
            if (response && response.messages) {
              const filteredMessages = response.messages.filter(
                (m) => !m.hiddenFrom?.includes(userInfo.userId)
              );
              // console.log(
              //   "Đã tải tin nhắn từ API khi thoát màn hình:",
              //   filteredMessages.map((msg) => msg.content)
              // );
              saveMessages(
                conversation.conversationId,
                filteredMessages,
                "before"
              ).then((savedMessages) => {
                console.log(
                  "Đã lưu tin nhắn từ API vào StorageService:",
                  savedMessages.map((msg) => msg.content)
                );
                handlerRefresh();
              });
            }
          })
          .catch((error) => {
            console.error(
              "Lỗi khi tải tin nhắn từ API khi thoát màn hình:",
              error
            );
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.conversationId, userInfo?.userId]);
  useEffect(() => {
    // Tìm conversation hiện tại trong conversations từ AuthContext
    const currentConversation = conversations.find(
      (conv) => conv.conversationId === conversation?.conversationId
    );

    if (currentConversation) {
      setMessages(currentConversation.messages);
    }
  }, [conversations, conversation?.conversationId]);
  useEffect(() => {
    console.log(
      "🧭 Navigation listener registered for conversation:",
      conversation?.conversationId
    );
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      console.log(
        `📡 Navigation: Thoát giao diện chat ${
          conversation?.conversationId || "undefined"
        }`
      );
      console.log("Navigation event details:", e);
    });
    return () => {
      console.log("🧭 Navigation listener removed");
      unsubscribe();
    };
  }, [navigation, conversation?.conversationId]);

  // Hàm so sánh tin nhắn storage và API
  const isMessagesDifferent = (storageMsgs, apiMsgs) => {
    if (storageMsgs.length !== apiMsgs.length) return true;
    for (let i = 0; i < storageMsgs.length; i++) {
      if (storageMsgs[i].messageDetailId !== apiMsgs[i].messageDetailId)
        return true;
      if (storageMsgs[i].content !== apiMsgs[i].content) return true;
      if (storageMsgs[i].createdAt !== apiMsgs[i].createdAt) return true;
    }
    return false;
  };

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Luôn hiển thị tin nhắn từ storage trước
      const cached = await getMessagesFromStorage(conversation.conversationId);
      setMessages(cached.reverse());

      // 2. Lấy tin nhắn mới nhất từ API
      const response = await api.getAllMessages(conversation.conversationId);
      if (response && response.messages) {
        const filtered = response.messages.filter(
          (m) => !m.hiddenFrom?.includes(userInfo.userId)
        );

        // 3. Nếu khác biệt thì đồng bộ và cập nhật giao diện
        await saveMessages(conversation.conversationId, filtered, "before");
        setMessages(filtered);
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn:", error);
      Alert.alert(
        "Lỗi",
        `Đã xảy ra lỗi khi tải tin nhắn: ${
          error.response?.data?.message || error.message
        }. Vui lòng thử lại.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversation?.conversationId, userInfo.userId]);

  useEffect(() => {
    if (!conversation?.conversationId) {
      console.error("Lỗi: Cuộc trò chuyện không tồn tại.");
      setMessages([]);
      return;
    }
    fetchMessages();
    console.log("Tin nhan81 duoc759 lay tu API:", messages);
  }, [conversation?.conversationId, fetchMessages]);

  const handleSendMessage = useCallback(
    async (message) => {
      if (!conversation?.conversationId) {
        alert("Không thể gửi tin nhắn: Cuộc trò chuyện không tồn tại.");
        return;
      }

      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `msg_${Date.now()}`,
        senderId: userInfo.userId,
        conversationId: conversation.conversationId,
        type: message.type || "text",
        content: message.content,
        createdAt: new Date().toISOString(),
        isReply: !!replyingTo,
        messageReplyId: replyingTo?.messageDetailId || null,
        replyData: replyingTo || null,
        sendStatus: "sending",
      };

      setMessages((prev) => [pseudoMessage, ...prev]);

      try {
        let res;
        if (message.type === "text") {
          if (replyingTo && replyingTo.messageDetailId) {
            res = await api.replyMessage(
              replyingTo.messageDetailId,
              message?.content
            );
          } else {
            res = await api.sendMessage({
              conversationId: pseudoMessage.conversationId,
              content: pseudoMessage.content,
            });
          }
          console.log("Phản hồi từ API gửi tin nhắn:", res);

          // Xóa pseudoMessage và thêm tin nhắn thực
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );
          setMessages((prev) => [res, ...prev]);
        }
      } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        alert(
          `Đã xảy ra lỗi khi gửi tin nhắn: ${
            error.response?.data?.message || error.message
          }. Vui lòng thử lại.`
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageDetailId === pseudoMessage.messageDetailId
              ? { ...msg, sendStatus: "failed" }
              : msg
          )
        );
      } finally {
        setReplyingTo(null);
      }
    },
    [conversation, userInfo.userId, replyingTo]
  );

  const handleSendImage = useCallback(
    async (message) => {
      if (!conversation?.conversationId) {
        alert("Không thể gửi tin nhắn: Cuộc trò chuyện không tồn tại.");
        console.error("Lỗi: Cuộc trò chuyện không tồn tại.");
        return;
      }

      console.log("Bắt đầu gửi ảnh...");
      const pseudoMessage = {
        conversationId: conversation.conversationId,
        messageDetailId: `msg_${Date.now()}`,
        createdAt: new Date().toISOString(),
        senderId: userInfo.userId,
        type: message.type || "image",
        sendStatus: "sending",
        attachment: { url: message.attachment },
      };
      console.log("Tạo pseudoMessage:", pseudoMessage);

      if (!message.attachment) {
        console.error("Lỗi: Không có ảnh để gửi.");
        alert("Không có ảnh để gửi.");
        return;
      }
      setMessages((prev) => [pseudoMessage, ...prev]);

      try {
        console.log("Đọc file ảnh từ URI:", message.attachment);
        const base64Image = await FileSystem.readAsStringAsync(
          message.attachment,
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );
        const imageBase64 = `data:image/jpeg;base64,${base64Image}`;
        console.log("Chuyển đổi ảnh sang Base64 thành công.");

        console.log("Bắt đầu gửi ảnh qua API...");
        const res = await api.sendImageMessage({
          conversationId: pseudoMessage.conversationId,
          imageBase64: imageBase64,
        });
        console.log("Gửi ảnh thành công:", res);

        // Xóa pseudoMessage và thêm tin nhắn thực
        setMessages((prev) =>
          prev.filter(
            (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
          )
        );
        setMessages((prev) => [res, ...prev]);
      } catch (error) {
        console.error("Lỗi khi gửi ảnh:", error);
        alert(
          `Đã xảy ra lỗi khi gửi ảnh: ${
            error.response?.data?.message || error.message
          }. Vui lòng thử lại.`
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageDetailId === pseudoMessage.messageDetailId
              ? { ...msg, sendStatus: "failed" }
              : msg
          )
        );
      }
    },
    [conversation, userInfo.userId]
  );

  const handleSendFile = useCallback(
    async (message) => {
      if (!conversation?.conversationId) {
        alert("Không thể gửi tin nhắn: Cuộc trò chuyện không tồn tại.");
        console.error("Lỗi: Cuộc trò chuyện không tồn tại.");
        return;
      }

      const pseudoMessage = {
        conversationId: conversation.conversationId,
        messageDetailId: `msg_${Date.now()}`,
        createdAt: new Date().toISOString(),
        senderId: userInfo.userId,
        type: message.type || "file",
        attachment: { url: message.attachment },
        sendStatus: "sending",
      };

      setMessages((prev) => [pseudoMessage, ...prev]);

      if (message.type === "file") {
        try {
          console.log("Đọc file từ URI:", message.attachment);
          const base64File = await FileSystem.readAsStringAsync(
            message.attachment,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          const fileBase64 = `data:${message.mimeType};base64,${base64File}`;
          console.log("Chuyển đổi file sang Base64 thành công.");

          const res = await api.sendFileMessage({
            conversationId: pseudoMessage.conversationId,
            fileBase64: fileBase64,
            fileName: message.fileName,
            fileType: message.type,
          });
          if (socket && socket.connected) {
            setMessages((prev) =>
              prev.filter(
                (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
              )
            );
            setMessages((prev) => [res, ...prev]);
          } else if (res) {
            setMessages((prev) =>
              prev.filter(
                (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
              )
            );
            setMessages((prev) => [res, ...prev]);
          } else {
            console.error("Lỗi: Không nhận được phản hồi từ API.");
            alert("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
          }

          console.log("Gửi file thành công!");
        } catch (error) {
          console.error("Lỗi khi gửi file:", error);
          alert(
            `Đã xảy ra lỗi khi gửi file: ${
              error.response?.data?.message || error.message
            }. Vui lòng thử lại.`
          );
          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageDetailId === pseudoMessage.messageDetailId
                ? { ...msg, sendStatus: "failed" }
                : msg
            )
          );
        }
      }
    },
    [conversation, userInfo.userId]
  );

  const handleSendVideo = useCallback(
    async (attachment) => {
      if (!conversation?.conversationId) {
        Alert.alert("Lỗi", "Cuộc trò chuyện không tồn tại.");
        return;
      }

      const pseudoMessage = {
        conversationId: conversation.conversationId,
        messageDetailId: `msg_${Date.now()}`,
        createdAt: new Date().toISOString(),
        senderId: userInfo.userId,
        type: "video",
        attachment: { url: attachment },
        sendStatus: "sending",
      };

      setMessages((prev) => [pseudoMessage, ...prev]);

      try {
        const response = await api.sendFileVideoMessage({
          conversationId: conversation.conversationId,
          attachment,
        });
        console.log("Gửi video thành công:", response);
        if (socket && socket.connected) {
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );
          setMessages((prev) => [response, ...prev]);
        } else if (response) {
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );
          setMessages((prev) => [response, ...prev]);
        } else {
          console.error("Lỗi: Không nhận được phản hồi từ API.");
          alert("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
        }
      } catch (error) {
        console.error("Lỗi khi gửi video:", error);
        Alert.alert(
          "Lỗi",
          `Không thể gửi video: ${
            error.response?.data?.message || error.message
          }. Vui lòng thử lại.`
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageDetailId === pseudoMessage.messageDetailId
              ? { ...msg, sendStatus: "failed" }
              : msg
          )
        );
      }
    },
    [conversation, userInfo.userId]
  );

  const handleSendAudio = useCallback(
    async (message) => {
      if (!conversation?.conversationId) {
        Alert.alert("Lỗi", "Cuộc trò chuyện không tồn tại.");
        return;
      }
      console.log("Loại tin nhắn:", message.attachment);

      const pseudoMessage = {
        conversationId: conversation.conversationId,
        messageDetailId: `msg_${Date.now()}`,
        createdAt: new Date().toISOString(),
        senderId: userInfo.userId,
        type: "audio",
        attachment: message.attachment,
        sendStatus: "sending",
      };
      console.log("File âm thanh:", message.attachment);
      setMessages((prev) => [pseudoMessage, ...prev]);

      try {
        const response = await api.sendFileVideoMessage({
          conversationId: conversation.conversationId,
          attachment: message.attachment,
        });
        console.log("Gửi audio thành công:", response);
        if (socket && socket.connected) {
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );
          setMessages((prev) => [response, ...prev]);
        } else if (response) {
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );
          setMessages((prev) => [response, ...prev]);
        } else {
          console.error("Lỗi: Không nhận được phản hồi từ API.");
          alert("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
        }
      } catch (error) {
        console.error("Lỗi khi gửi audio:", error);
        Alert.alert(
          "Lỗi",
          `Không thể gửi audio: ${
            error.response?.data?.message || error.message
          }. Vui lòng thử lại.`
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageDetailId === pseudoMessage.messageDetailId
              ? { ...msg, sendStatus: "failed" }
              : msg
          )
        );
      }
    },
    [conversation, userInfo.userId]
  );
  const handleReply = (message) => {
    setReplyingTo(message);
  };

  // Hàm tìm kiếm tin nhắn
  const performSearch = useCallback(
    (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setCurrentIndex(-1);
        setHighlightedMessageId(null);
        return;
      }

      const fuse = new Fuse(
        messages.filter(
          (msg) =>
            msg.type === "text" &&
            !msg.isRecall &&
            !msg.hiddenFrom?.includes(userInfo.userId) &&
            msg.type !== "notification"
        ),
        {
          keys: ["content"],
          threshold: 0.3,
          includeMatches: true,
        }
      );

      let results = fuse.search(query).map((result) => result.item);

      // Sort results to maintain the original order of messages
      results = results.sort((a, b) => {
        const indexA = messages.findIndex(
          (msg) => msg.messageDetailId === a.messageDetailId
        );
        const indexB = messages.findIndex(
          (msg) => msg.messageDetailId === b.messageDetailId
        );
        return indexA - indexB;
      });

      setSearchResults(results);

      if (results.length > 0) {
        const nearestIndex = results.findIndex(
          (msg) => msg.messageDetailId === highlightedMessageId
        );
        const targetIndex = nearestIndex !== -1 ? nearestIndex : 0;

        setCurrentIndex(targetIndex);
        setHighlightedMessageId(results[targetIndex].messageDetailId);
        scrollToMessage(results[targetIndex].messageDetailId);
      } else {
        setCurrentIndex(-1);
        setHighlightedMessageId(null);
      }
    },
    [messages, highlightedMessageId, userInfo.userId]
  );

  useEffect(() => {
    if (isSearching) {
      performSearch(searchQuery);
    }
  }, [searchQuery, isSearching, performSearch]);

  // Điều hướng đến tin nhắn trước
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setHighlightedMessageId(searchResults[newIndex].messageDetailId);
      scrollToMessage(searchResults[newIndex].messageDetailId);
    }
  };

  // Điều hướng đến tin nhắn tiếp theo
  const handleNext = () => {
    if (currentIndex < searchResults.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setHighlightedMessageId(searchResults[newIndex].messageDetailId);
      scrollToMessage(searchResults[newIndex].messageDetailId);
    }
  };

  // Hàm cuộn đến tin nhắn
  const scrollToMessage = (messageId) => {
    const index = messages.findIndex(
      (msg) => msg.messageDetailId === messageId
    );
    if (index === -1) {
      console.warn("Không tìm thấy message:", messageId);
      return;
    }

    if (flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index: index,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (error) {
        console.warn("Lỗi cuộn đến message:", error.message);
        flatListRef.current.scrollToOffset({
          offset: Math.max(0, index * 80),
          animated: true,
        });
      }
    }
  };

  // Thoát chế độ tìm kiếm
  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    setSearchResults([]);
    setCurrentIndex(-1);
    setHighlightedMessageId(null);
  };

  useEffect(() => {
    console.log("🏗️ MessageScreen mounted");
    setIsMessageScreenActive(true); // Đặt trạng thái khi mount

    return () => {
      console.log("🏚️ MessageScreen unmounted");
      setIsMessageScreenActive(false); // Xóa trạng thái khi unmount
    };
  }, [setIsMessageScreenActive]);

  useMessageSocketEvents({
    socket,
    conversation,
    userInfo,
    handlerRefresh,
    setMessages,
    saveGroupMembers,
    groupMember,
    changeRole,
    navigation,
  });

  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      {isSearching ? (
        <SearchHeader onSearch={setSearchQuery} onCancel={handleCancelSearch} />
      ) : (
        <ChatHeader
          navigation={navigation}
          receiver={receiver}
          conversation={conversation}
          lastActiveStatus={calculateLastActive(receiver?.lastActive)}
        />
      )}
      <ImageBackground
        source={effectiveBackground ? { uri: effectiveBackground } : null}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {messages.length > 0 ? (
          <Conversation
            messages={messages}
            setMessages={setMessages}
            senderId={userInfo.userId}
            highlightedMessageId={highlightedMessageId}
            searchQuery={searchQuery}
            receiver={receiver}
            onTyping={isTyping}
            onReply={setReplyingTo}
            flatListRef={flatListRef}
            onScrollToMessage={scrollToMessage}
            conversationId={conversation.conversationId}
            fetchMessages={fetchMessages}
          />
        ) : (
          <View style={MessageScreenStyle.loadingContainer}>
            {isLoading ? (
              <Text style={MessageScreenStyle.loadingText}>Đang tải...</Text>
            ) : (
              <Text style={MessageScreenStyle.emptyText}>
                Không có tin nhắn
              </Text>
            )}
          </View>
        )}
        {isSearching && (
          <SearchFooter
            resultCount={searchResults.length}
            currentIndex={currentIndex}
            onNext={handleNext}
            onPrevious={handlePrevious}
            disableNext={currentIndex >= searchResults.length - 1}
            disablePrevious={currentIndex <= 0}
          />
        )}
        <ChatFooter
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          onSendFile={handleSendFile}
          onSendVideo={handleSendVideo}
          onSendAudio={handleSendAudio}
          socket={socket}
          conversation={conversation}
          setIsTyping={setIsTyping}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "gray",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
});

export default MessageScreen;
