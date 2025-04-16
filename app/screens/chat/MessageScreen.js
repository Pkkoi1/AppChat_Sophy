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
  KeyboardAvoidingViewComponent,
  KeyboardAvoidingView,
  TextInput,
  StatusBar,
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

const MessageScreen = ({ route, navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const { conversation, startSearch, receiver } = route.params;

  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(startSearch || false);
  const [highlightedMessageIds, setHighlightedMessageIds] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const flatListRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading
  const [imageUri, setImageUri] = useState(null); // Trạng thái lưu trữ URI hình ảnh đã chọn

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

  const fetchAndStoreMessages = async () => {
    try {
      setIsLoading(true); // Bật loading

      const response = await api.getAllMessages(conversation.conversationId);

      // console.log("Tin nhắn được lấy từ API:", response);

      setMessages(response.messages); // Cập nhật state messages
    } catch (error) {
      console.error("Lỗi lấy tin nhắn:", error);
      setMessages([]); // Cập nhật state messages với mảng rỗng nếu lỗi
    } finally {
      setIsLoading(false); // Tắt loading
    }
  };

  const handleSendMessage = useCallback(
    (message) => {
      if (!conversation?.conversationId) {
        alert("Không thể gửi tin nhắn: Cuộc trò chuyện không tồn tại.");
        return;
      }

      const pseudoMessage = {
        conversationId: conversation.conversationId,
        content: message.content,
        messageDetailId: `msg_${Date.now()}`,
        createdAt: new Date().toISOString(),
        senderId: userInfo.userId,
        type: message.type || "text",
      };
      setMessages((prev) => [pseudoMessage, ...(prev || [])]);

      if (message.type === "text") {
        api
          .sendMessage({
            conversationId: pseudoMessage.conversationId,
            content: pseudoMessage.content,
          })
          .catch((error) => {
            console.error("Lỗi gửi tin nhắn:", error);
            alert("Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.");
          });
      }
    },
    [conversation, userInfo.userId]
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
        attachment: { url: message.attachment }, // Corrected syntax
      };

      console.log("Tạo pseudoMessage:", pseudoMessage);

      setImageUri(message.attachment); // Set the image URI to state
      setMessages((prev) => [pseudoMessage, ...(prev || [])]);

      if (!message.attachment) {
        console.error("Lỗi: Không có ảnh để gửi.");
        alert("Không có ảnh để gửi.");
        return;
      }

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
      } catch (error) {
        console.error("Lỗi khi gửi ảnh:", error);
        alert("Đã xảy ra lỗi khi gửi ảnh. Vui lòng thử lại.");
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
        attachment: { url: message.attachment }, // Corrected syntax
      };

      setMessages((prev) => [pseudoMessage, ...(prev || [])]);

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
          console.log("Gửi file thành công!");
        } catch (error) {
          console.error("Lỗi khi gửi file:", error);
          alert("Đã xảy ra lỗi khi gửi file. Vui lòng thử lại.");
        }
      }
    },
    [conversation, userInfo.userId]
  );

  useEffect(() => {
    if (!conversation?.conversationId) {
      console.error("Lỗi: Cuộc trò chuyện không tồn tại.");
      setMessages([]); // Clear messages if conversation is invalid
      return;
    }

    fetchAndStoreMessages();
  }, [conversation?.conversationId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#ebecf0" }}>
      <StatusBar />
      <ChatHeader
        navigation={navigation}
        receiver={receiver}
        conversation={conversation}
        lastActiveStatus={calculateLastActive(receiver?.lastActive)}
      />
      {messages.length > 0 ? (
        <Conversation
          conversation={{ messages }}
          senderId={userInfo.userId}
          highlightedMessageIds={highlightedMessageIds}
          highlightedMessageId={highlightedMessageId}
          searchQuery={searchQuery}
          receiver={receiver}
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
      />
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
