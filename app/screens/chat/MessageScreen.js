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
import { setupMessageSocketEvents } from "@/app/socket/socketEvents/MessageSocketEvents";

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
              console.log(
                "Đã tải tin nhắn từ API khi thoát màn hình:",
                filteredMessages.map((msg) => msg.content)
              );

              saveMessages(
                conversation.conversationId,
                filteredMessages,
                "before",
                (savedMessages) => {
                  console.log(
                    "Đã lưu tin nhắn từ API vào AsyncStorage:",
                    savedMessages.map((msg) => msg.content)
                  );
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

  // Thiết lập sự kiện socket
  useEffect(() => {
    const cleanup = setupMessageSocketEvents(
      socket,
      conversation,
      userInfo,
      setMessages,
      saveGroupMembers,
      groupMember,
      changeRole,
      handlerRefresh,
      navigation
    );
    return cleanup;
  }, [
    socket,
    conversation,
    userInfo,
    setMessages,
    saveGroupMembers,
    groupMember,
    changeRole,
    handlerRefresh,
    navigation,
  ]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);

      // Load from context
      const cached = await getMessages(conversation.conversationId);
      if (cached && cached.length > 0) {
        setMessages(cached);
        console.log(
          "Tin nhắn đã tải từ context:",
          cached.map((msg) => msg.content)
        );
      }

      // Làm mới từ API để đồng bộ
      const response = await api.getAllMessages(conversation.conversationId);
      if (response && response.messages) {
        const filtered = response.messages.filter(
          (m) => !m.hiddenFrom?.includes(userInfo.userId)
        );
        console.log(
          "Tin nhắn đã tải từ API:",
          filtered.map((msg) => msg.content)
        );

        // Lưu tin nhắn vào AsyncStorage ngay khi tải từ API
        await saveMessages(
          conversation.conversationId,
          filtered,
          "before",
          (savedMessages) => {
            setMessages(savedMessages);
            console.log(
              "Danh sách tin nhắn cuối cùng sau khi lưu:",
              savedMessages.map((msg) => msg.content)
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
        setHighlightedMessageId(messageId);

        setTimeout(() => setHighlightedMessageId(null), 2000);
      } catch (error) {
        console.warn("Lỗi cuộn đến message:", error.message);

        flatListRef.current.scrollToOffset({
          offset: Math.max(0, index * 80),
          animated: true,
        });

        setHighlightedMessageId(messageId);
        setTimeout(() => setHighlightedMessageId(null), 2000);
      }
    }
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
      <ChatHeader
        navigation={navigation}
        receiver={receiver}
        conversation={conversation}
        lastActiveStatus={calculateLastActive(receiver?.lastActive)}
      />
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
            highlightedMessageIds={highlightedMessageIds}
            highlightedMessageId={highlightedMessageId}
            searchQuery={searchQuery}
            receiver={receiver}
            onTyping={isTyping}
            onReply={handleReply}
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
