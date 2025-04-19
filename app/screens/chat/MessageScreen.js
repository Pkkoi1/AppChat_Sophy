import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
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

const MessageScreen = ({ route, navigation }) => {
  const { userInfo, handlerRefresh, background } = useContext(AuthContext);
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
      handleNewMessage(
        socket,
        conversation.conversationId,
        setMessages,
        flatListRef
      );
      socket.on("newMessage", async () => {
        await handlerRefresh();
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
      return () => {
        cleanupNewMessage(socket);
        socket.off("newMessage");
        socket.off("messageRecalled");
        socket.off("messagePinned");
        socket.off("messageUnpinned");
        socket.off("newConversation");
      };
    }
  }, [messages, sended]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllMessages(conversation.conversationId);
      const filteredMessages = response.messages.filter(
        (message) => !message.hiddenFrom?.includes(userInfo.userId)
      );
      // console.log(
      //   "Tin nhắn đã tải:",
      //   filteredMessages.map((msg) => msg.messageDetailId)
      // );
      setMessages(filteredMessages);
    } catch (error) {
      console.error("Lỗi lấy tin nhắn:", error);
      setMessages([]);
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
        replyData: replyingTo
          ? {
              content: replyingTo.content,
              type: replyingTo.type,
              senderId: replyingTo.senderId,
            }
          : null, // Include reply data if replying
        sendStatus: "sending", // Initial status
      };

      setMessages((prev) => [pseudoMessage, ...prev]);

      try {
        if (message.type === "text") {
          if (replyingTo) {
            await api.replyMessage(
              replyingTo?.messageDetailId,
              message?.content
            );
          } else {
            await api.sendMessage({
              conversationId: pseudoMessage.conversationId,
              content: pseudoMessage.content,
            });
          }
        }

        if (socket && socket.connected) {
          socket.emit("newMessage", {
            conversationId: pseudoMessage.conversationId,
            message: pseudoMessage,
            sender: {
              userId: userInfo.userId,
              fullname: userInfo.fullname,
              avatar: userInfo.urlavatar,
            },
          });

          // Remove the pseudoMessage immediately after emitting the socket event
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );

          console.log("Gửi tin nhắn qua socket:", pseudoMessage);
        }
      } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        alert("Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.");
      } finally {
        setReplyingTo(null); // Clear reply state after sending
      }
    },
    [conversation, userInfo.userId, socket, replyingTo]
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
          await api.sendImageMessage({
            conversationId: pseudoMessage.conversationId,
            imageBase64: imageBase64,
          });
          console.log("Gửi ảnh thành công!");
        }
        if (socket && socket.connected) {
          socket.emit("newMessage", {
            conversationId: pseudoMessage.conversationId,
            message: pseudoMessage,
            sender: {
              userId: userInfo.userId,
              fullname: userInfo.fullname,
              avatar: userInfo.urlavatar,
            },
          });

          // Remove the pseudoMessage immediately after emitting the socket event
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );

          console.log("Gửi hình qua socket:", pseudoMessage);
        }
      } catch (error) {
        console.error("Lỗi khi gửi ảnh:", error);
        alert("Đã xảy ra lỗi khi gửi ảnh. Vui lòng thử lại.");
      }
    },
    [conversation, userInfo.userId, socket]
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

          await api.sendFileMessage({
            conversationId: pseudoMessage.conversationId,
            fileBase64: fileBase64,
            fileName: message.fileName,
            fileType: message.mimeType,
          });
          if (socket && socket.connected) {
            socket.emit("newMessage", {
              conversationId: pseudoMessage.conversationId,
              message: pseudoMessage,
              sender: {
                userId: userInfo.userId,
                fullname: userInfo.fullname,
                avatar: userInfo.urlavatar,
              },
            });

            // Remove the pseudoMessage immediately after emitting the socket event
            setMessages((prev) =>
              prev.filter(
                (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
              )
            );

            console.log("Gửi tin nhắn qua socket:", pseudoMessage);
          }
          console.log("Gửi file thành công!");
        } catch (error) {
          console.error("Lỗi khi gửi file:", error);
          alert("Đã xảy ra lỗi khi gửi file. Vui lòng thử lại.");
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
        attachment,
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
          socket.emit("newMessage", {
            conversationId: pseudoMessage.conversationId,
            message: pseudoMessage,
            sender: {
              userId: userInfo.userId,
              fullname: userInfo.fullname,
              avatar: userInfo.urlavatar,
            },
          });

          // Remove the pseudoMessage immediately after emitting the socket event
          setMessages((prev) =>
            prev.filter(
              (msg) => msg.messageDetailId !== pseudoMessage.messageDetailId
            )
          );

          console.log("Gửi video qua socket:", pseudoMessage);
        }
      } catch (error) {
        console.error("Lỗi khi gửi video:", error);
        Alert.alert("Lỗi", "Không thể gửi video. Vui lòng thử lại.");
      }
    },
    [conversation, userInfo.userId, socket]
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
          viewPosition: 0.5,
        });
        setHighlightedMessageId(messageId);

        // Reset highlightedMessageId after 2 seconds
        setTimeout(() => setHighlightedMessageId(null), 500);
      } catch (error) {
        console.warn("Lỗi cuộn đến message:", error.message);
        // Fallback nếu lỗi out-of-range
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: index * 80, // height mặc định 80 trong getItemLayout
            animated: true,
          });
        }, 300);
      }
    }
  };

  const effectiveBackground = background || conversation?.background || null;

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
