import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  memo,
} from "react";
import {
  SafeAreaView,
  View,
  Text,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  StatusBar,
  ImageBackground,
  InteractionManager,
  TouchableOpacity,
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
import {
  getMessages,
  saveMessages,
  appendMessage,
} from "../../storage/StorageService";

const MessageScreen = ({ route, navigation }) => {
  const { userInfo, handlerRefresh, background, checkLastMessageDifference } =
    useContext(AuthContext);
  const socket = useContext(SocketContext);

  const { conversation, startSearch, receiver } = route.params;

  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(startSearch || false);
  const [highlightedMessageIds, setHighlightedMessageIds] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null); // State cho tin nhắn đang trả lời
  const flatListRef = useRef(null); // Attach FlatList ref here
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

  useEffect(() => {
    if (socket && conversation?.conversationId) {
      socket.emit("joinUserConversations", [conversation.conversationId]);
      // handleNewMessage(
      //   socket,
      //   conversation,
      //   setMessages,
      //   flatListRef,
      //   saveMessages
      // );
      socket.on("newMessage", async ({ conversationId, message, sender }) => {
        if (conversationId === conversation.conversationId) {
          console.log(
            "Đã nhận tin nhắn mới trong cuộc trò chuyện:",
            conversationId
          );

          // Mark the message as read
          api.readMessage(conversationId);
          if (
            conversationId === conversation.conversationId &&
            message?.senderId !== userInfo?.userId // Đừng xử lý nếu chính mình gửi
          ) {
            // Update the messages state
            setMessages((prevMessages) => [message, ...prevMessages]);

            // Optionally refresh the conversation list
            await handlerRefresh();
          }
          console.log("Tin nhắn mới:", {
            conversationId,
            message,
            sender,
          });
        }
      });
      if (socket) {
        socket.on("newConversation", async () => {
          console.log("New convertation received. Refreshing conversations...");
          await handlerRefresh(); // Refresh the conversation list
        });
      }
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

      socket.on("groupDeleted", async () => {
        console.log("Nhóm đã bị xóa. Đang làm mới cuộc trò chuyện...");
        // await handlerRefresh(); // Refresh the conversation list
        navigation.navigate("Home");
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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageDetailId === data.messageDetailId
                ? { ...msg, groupAvatar: data.groupAvatar }
                : msg
            )
          );
        }
        console.log(
          "Nhận tin nhắn đã thay đổi ảnh nhóm qua socket:",
          data.conversationId,
          data.messageDetailId
        );
      });
      socket.on("groupNameChanged", (data) => {
        if (data.conversationId === conversation.conversationId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageDetailId === data.messageDetailId
                ? { ...msg, groupName: data.groupName }
                : msg
            )
          );
        }
      });
      socket.on('groupCoOwnerAdded', ({ conversationId, newCoOwnerIds }) => {
          if (conversationId === conversation.conversationId) {
              console.log('Đã thêm đồng chủ sở hữu:', newCoOwnerIds);
              // Cập nhật state hoặc thông báo cho người dùng
          }
      });
  
      socket.on('groupCoOwnerRemoved', ({ conversationId, removedCoOwner }) => {
          if (conversationId === conversation.conversationId) {
              console.log('Đã xóa đồng chủ sở hữu:', removedCoOwner);
              // Cập nhật state hoặc thông báo cho người dùng
          }
      });
  
      socket.on('userBlocked', ({ conversationId, blockedUserId }) => {
          if (conversationId === conversation.conversationId) {
              console.log('Người dùng đã bị chặn:', blockedUserId);
              // Cập nhật state hoặc thông báo cho người dùng
          }
      });
  
      socket.on('userUnblocked', ({ conversationId, unblockedUserId }) => {
          if (conversationId === conversation.conversationId) {
              console.log('Người dùng đã được bỏ chặn:', unblockedUserId);
              // Cập nhật state hoặc thông báo cho người dùng
          }
      });
      return () => {
        // socket.off("newMessage");
        socket.off("messageRecalled");
        socket.off("messagePinned");
        socket.off("messageUnpinned");
        socket.off("newConversation");
      };
    }
  }, [socket, conversation, handlerRefresh]);

  const checkStorageSpace = async () => {
    try {
      const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
      if (info.exists && info.totalSpace && info.freeSpace) {
        const freeSpaceMB = info.freeSpace / (1024 * 1024); // Chuyển đổi sang MB
        console.log(`Dung lượng trống: ${freeSpaceMB.toFixed(2)} MB`);
        return freeSpaceMB > 10; // Đảm bảo còn ít nhất 10MB trống
      }
      return true; // Nếu không lấy được thông tin, giả định đủ bộ nhớ
    } catch (error) {
      console.error("Lỗi khi kiểm tra bộ nhớ:", error);
      return true; // Nếu lỗi, giả định đủ bộ nhớ
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);

      // Kiểm tra bộ nhớ trước khi tải tin nhắn
      const hasEnoughSpace = await checkStorageSpace();
      if (!hasEnoughSpace) {
        alert("Bộ nhớ không đủ. Vui lòng giải phóng dung lượng và thử lại.");
        return;
      }

      // Bước 1: Load từ cache
      const cached = await getMessages(conversation.conversationId);
      setMessages(cached || []); // Đảm bảo cached không phải undefined

      // Bước 2: Gọi API lấy mới
      const response = await api.getAllMessages(conversation.conversationId);

      if (!response || !response.messages) {
        throw new Error("API không trả về dữ liệu tin nhắn hợp lệ.");
      }

      const filtered = response.messages.filter(
        (m) => !m.hiddenFrom?.includes(userInfo.userId)
      );

      const updated = await saveMessages(conversation.conversationId, filtered);
      setMessages(updated || []); // Đảm bảo updated không phải undefined
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
        _id: `temp_${Date.now()}`, // Temporary ID for local rendering
        messageDetailId: `msg_${Date.now()}`,
        senderId: userInfo.userId,
        conversationId: conversation.conversationId,
        type: message.type || "text",
        content: message.content,
        createdAt: new Date().toISOString(),
        isReply: !!replyingTo,
        messageReplyId: replyingTo?.messageDetailId || null,
        replyData: replyingTo || null, // Ensure replyData is not undefined
        sendStatus: "sending", // Initial status
      };

      // Display the message immediately
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
          if (socket && socket.connected) {
            // Replace the pseudo message with the actual message from the API
            setMessages((prev) =>
              prev.filter(
                (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
              )
            );
            setMessages((prev) => [res, ...prev]);

            await appendMessage(conversation.conversationId, res.message);
          } else if (res) {
            setMessages((prev) =>
              prev.filter(
                (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
              )
            );
            setMessages((prev) => [res, ...prev]);
            await appendMessage(conversation.conversationId, res.message);
          } else {
            console.error("Lỗi: Không nhận được phản hồi từ API.");
            alert("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
          }
        }
        setSended((prev) => !prev);
      } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        alert(
          `Đã xảy ra lỗi khi gửi tin nhắn: ${
            error.response?.data?.message || error.message
          }. Vui lòng thử lại.`
        );
        // Mark the pseudo message as failed
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

        if (message.type === "image") {
          console.log("Bắt đầu gửi ảnh qua API...");
          const res = await api.sendImageMessage({
            conversationId: pseudoMessage.conversationId,
            imageBase64: imageBase64,
          });
          console.log("Gửi ảnh thành công:", res);
          if (socket && socket.connected) {
            setMessages((prev) =>
              prev.filter(
                (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
              )
            );
            setMessages((prev) => [res, ...prev]);
            await appendMessage(conversation.conversationId, res);
          } else if (res) {
            setMessages((prev) =>
              prev.filter(
                (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
              )
            );
            setMessages((prev) => [res, ...prev]);
            await appendMessage(conversation.conversationId, res.message);
          } else {
            console.error("Lỗi: Không nhận được phản hồi từ API.");
            alert("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
          }
        }
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
            setMessages((prev) => [pseudoMessage, ...prev]);
            await appendMessage(conversation.conversationId, res);
          } else if (res) {
            setMessages((prev) =>
              prev.filter(
                (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
              )
            );
            setMessages((prev) => [res, ...prev]);
            await appendMessage(conversation.conversationId, res.message);
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
          // setMessages((prev) => [response, ...prev]);
          await appendMessage(conversation.conversationId, response);
        } else if (res) {
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );
          setMessages((prev) => [res, ...prev]);
          await appendMessage(conversation.conversationId, res.message);
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
    setReplyingTo(message); // Cập nhật tin nhắn đang trả lời
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
          viewPosition: 0.5, // Vị trí hiển thị tin nhắn ở giữa màn hình
        });
        setHighlightedMessageId(messageId);

        // Reset highlightedMessageId sau 2 giây
        setTimeout(() => setHighlightedMessageId(null), 2000);
      } catch (error) {
        console.warn("Lỗi cuộn đến message:", error.message);

        // Fallback nếu lỗi out-of-range
        flatListRef.current.scrollToOffset({
          offset: Math.max(0, index * 80), // Tính toán offset dựa trên chiều cao item
          animated: true,
        });

        // Đảm bảo tin nhắn được highlight sau fallback
        setHighlightedMessageId(messageId);
        setTimeout(() => setHighlightedMessageId(null), 2000);
      }
    }
  };

  const effectiveBackground = background || conversation?.background || null;

  const MemoizedConversation = memo(Conversation, (prevProps, nextProps) => {
    // So sánh các props để tránh render lại không cần thiết
    return (
      prevProps.messages === nextProps.messages &&
      prevProps.highlightedMessageId === nextProps.highlightedMessageId &&
      prevProps.searchQuery === nextProps.searchQuery &&
      prevProps.senderId === nextProps.senderId
    );
  });

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
            highlightedMessageId={highlightedMessageId} // Pass highlightedMessageId
            searchQuery={searchQuery}
            receiver={receiver}
            onTyping={isTyping}
            onReply={handleReply}
            flatListRef={flatListRef} // Pass FlatList ref to Conversation
            onScrollToMessage={scrollToMessage} // Pass scrollToMessage to Conversation
            conversationId={conversation.conversationId} // Truyền conversationId
            fetchMessages={fetchMessages} // Truyền fetchMessages
          />
        ) : (
          <View style={MessageScreenStyle.loadingContainer}>
            <Text style={MessageScreenStyle.loadingText}>Đang tải...</Text>
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
