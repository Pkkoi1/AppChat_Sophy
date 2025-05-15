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

const MessageScreen = ({ route, navigation }) => {
  const {
    userInfo,
    handlerRefresh,
    background,
    groupMember,
    saveGroupMembers,
    changeRole,
    getMessages,
    saveMessages,
  } = useContext(AuthContext);
  const socket = useContext(SocketContext);

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

  // Lưu tin nhắn vào AsyncStorage khi thoát màn hình
  useEffect(() => {
    return () => {
      if (conversation?.conversationId) {
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
                "before",
                (savedMessages) => {
                  // console.log(
                  //   "Đã lưu tin nhắn từ API vào AsyncStorage:",
                  //   savedMessages.map((msg) => msg.content)
                  // );
                }
              );
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
  }, [messages, conversation.conversationId, saveMessages]);

  useEffect(() => {
    if (socket && conversation?.conversationId) {
      socket.emit("joinUserConversations", [conversation.conversationId]);

      socket.on("newMessage", async ({ conversationId, message, sender }) => {
        if (conversationId === conversation.conversationId) {
          console.log(
            "Đã nhận tin nhắn mới trong cuộc trò chuyện:",
            conversationId,
            message.content
          );

          // Mark the message as read
          api.readMessage(conversationId);
          if (
            conversationId === conversation.conversationId &&
            message?.senderId !== userInfo?.userId
          ) {
            // Chỉ thêm tin nhắn vào trạng thái messages
            setMessages((prevMessages) => [message, ...prevMessages]);
          }
        }
      });

      socket.on("newConversation", async () => {
        console.log("New conversation received. Refreshing conversations...");
        await handlerRefresh();
      });

      socket.on("messageRecalled", ({ conversationId, messageId }) => {
        if (conversationId === conversation.conversationId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageDetailId === messageId
                ? { ...msg, isRecall: true }
                : msg
            )
          );
        }
        console.log(
          "Nhận tin nhắn đã thu hồi qua socket:",
          conversationId,
          messageId
        );
      });

      socket.on("messagePinned", ({ conversationId, messageId }) => {
        if (conversationId === conversation.conversationId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageDetailId === messageId
                ? { ...msg, isPinned: true, pinnedAt: new Date() }
                : msg
            )
          );
        }
        console.log(
          "Nhận tin nhắn đã ghim qua socket:",
          conversationId,
          messageId
        );
      });

      socket.on("messageUnpinned", ({ conversationId, messageId }) => {
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
      });

      socket.on("groupAvatarChanged", (data) => {
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
      });

      socket.on("groupNameChanged", (data) => {
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
      });

      socket.on("userAddedToGroup", async (data) => {
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
      });

      socket.on("userLeftGroup", (data) => {
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
      });

      socket.on("userRemovedFromGroup", (data) => {
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
      });

      socket.on("groupOwnerChanged", (data) => {
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
      });

      socket.on("groupCoOwnerAdded", (data) => {
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
            `Nhóm phó đã được thêm: ${data.newCoOwnerIds.join(
              ", "
            )} trong nhóm ${data.conversationId}`
          );
        }
      });

      socket.on("userUnblocked", async (data) => {
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
      });

      socket.on("groupCoOwnerRemoved", (data) => {
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
          changeRole(
            conversation.conversationId,
            data.removedCoOwner,
            "member"
          );
          console.log(
            `Nhóm phó đã bị loại bỏ: ${data.removedCoOwnerIds.join(
              ", "
            )} trong nhóm ${data.conversationId}`
          );
        }
      });

      socket.on("groupDeleted", () => {
        handlerRefresh();
        Alert.alert("Nhóm đã bị xóa. Đang điều hướng về trang chính...");
        navigation.navigate("Home");
      });

      socket.on("userBlocked", (data) => {
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
      });

      return () => {
        socket.off("newMessage");
        socket.off("messageRecalled");
        socket.off("messagePinned");
        socket.off("messageUnpinned");
        socket.off("newConversation");
        socket.off("groupAvatarChanged");
        socket.off("groupNameChanged");
        socket.off("userAddedToGroup");
        socket.off("userLeftGroup");
        socket.off("userRemovedFromGroup");
        socket.off("groupOwnerChanged");
        socket.off("groupCoOwnerAdded");
        socket.off("groupCoOwnerRemoved");
        socket.off("groupDeleted");
        socket.off("userBlocked");
        socket.off("userUnblocked");
      };
    }
  }, [socket, conversation, handlerRefresh, userInfo]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);

      // Load from context
      const cached = await getMessages(conversation.conversationId);
      if (cached && cached.length > 0) {
        setMessages(cached);
        console.log("Tin nhắn đầu tiên từ context:", cached[0]); // Log first message
      }

      // Làm mới từ API để đồng bộ
      const response = await api.getAllMessages(conversation.conversationId);
      if (response && response.messages) {
        const filtered = response.messages.filter(
          (m) => !m.hiddenFrom?.includes(userInfo.userId)
        );

        console.log("Tin nhắn đầu tiên từ API:", filtered[0]); // Log first message

        // Lưu tin nhắn vào AsyncStorage ngay khi tải từ API
        await saveMessages(
          conversation.conversationId,
          filtered,
          "before",
          (savedMessages) => {
            setMessages(savedMessages);
            console.log(
              "Tin nhắn đầu tiên sau khi lưu:",
              savedMessages[0] // Log first message
            );
          }
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn:", error);
      alert(
        `Đã xảy ra lỗi khi tải tin nhắn: ${
          error.response?.data?.message || error.message
        }. Vui lòng thử lại.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!conversation?.conversationId) {
      console.error("Lỗi: Cuộc trò chuyện không tồn tại.");
      setMessages([]);
      return;
    }
    fetchMessages();
  }, [conversation?.conversationId]);

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
            fileType: message.mimeType,
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

  const effectiveBackground = background || conversation?.background || null;

  const MemoizedConversation = memo(Conversation, (prevProps, nextProps) => {
    return (
      prevProps.messages === nextProps.messages &&
      prevProps.highlightedMessageId === nextProps.highlightedMessageId &&
      prevProps.searchQuery === nextProps.searchQuery &&
      prevProps.senderId === nextProps.senderId
    );
  });

  const addGroupMember = async (conversation) => {
    if (conversation?.isGroup && Array.isArray(conversation.groupMembers)) {
      const membersWithRoles = await Promise.all(
        conversation.groupMembers.map(async (memberId) => {
          const memberInfo = await fetchUserInfo(memberId);
          return {
            id: memberId,
            role:
              memberId === conversation.rules?.ownerId
                ? "owner"
                : conversation.rules?.coOwnerIds?.includes(memberId)
                ? "co-owner"
                : "member",
            fullName: memberInfo?.fullname || "Unknown",
            urlAvatar: memberInfo?.urlavatar || null,
          };
        })
      );
      saveGroupMembers(conversation.conversationId, membersWithRoles);
      console.log(
        "Đã lưu danh sách thành viên nhóm với vai trò, tên và avatar:",
        membersWithRoles
      );
    }
  };

  useEffect(() => {
    if (conversation?.isGroup) {
      addGroupMember(conversation);
    }
  }, [conversation]);

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
