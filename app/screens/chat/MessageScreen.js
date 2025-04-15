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
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatHeader from "./header/ChatHeader";
import SearchHeader from "./optional/name/searchMessage/SearchHeader";
import SearchFooter from "./optional/name/searchMessage/SearchFooter";
import ChatFooter from "./footer/ChatFooter";
import Conversation from "./message/Conversation";
import MessageScreenStyle from "./MessageScreenStyle";
import Fuse from "fuse.js";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";

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

  const [oldCursor, setOldCursor] = useState(null);
  const [newCursor, setNewCursor] = useState(null);

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

  // Hàm lưu tin nhắn vào AsyncStorage
  const saveMessagesToStorage = async (messages) => {
    try {
      await AsyncStorage.setItem(
        `messages_${conversation.conversationId}`,
        JSON.stringify(messages)
      );
      console.log("Tin nhắn đã được lưu vào AsyncStorage.");
      console.log("Tin nhắn đã được lưu:", messages);
    } catch (error) {
      console.error("Lỗi khi lưu tin nhắn vào AsyncStorage:", error);
    }
  };

  // Hàm lấy tin nhắn từ AsyncStorage
  const loadMessagesFromStorage = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(
        `messages_${conversation.conversationId}`
      );
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        // console.log("Tin nhắn được load từ AsyncStorage:", parsed);
        setMessages(parsed);
      } else {
        console.log("Không tìm thấy tin nhắn trong AsyncStorage.");
        setMessages([]);
      }
    } catch (error) {
      console.error("Lỗi khi load tin nhắn từ AsyncStorage:", error);
    }
  };
  const fetchAndStoreMessages = async () => {
    try {
      setIsLoading(true); // Bật loading

      const response = await api.getMessages(conversation.conversationId);
      const { messages: fetchedMessages } = response;

      // console.log("Tin nhắn được lấy từ API:", response);

      await saveMessagesToStorage(fetchedMessages || []);
    } catch (error) {
      console.error("Lỗi lấy tin nhắn:", error);
      await saveMessagesToStorage([]); // Lưu mảng rỗng nếu lỗi
    } finally {
      await loadMessagesFromStorage(); // Load từ storage để hiển thị
      setIsLoading(false); // Tắt loading
    }
  };
  const handleSendMessage = useCallback(
    (message) => {
      if (!conversation?.conversationId) {
        alert("Không thể gửi tin nhắn: Cuộc trò chuyện không tồn tại.");
        return;
      }

      const newMessage = {
        conversationId: conversation.conversationId,
        content: message.content,
        messageDetailId: `msg_${Date.now()}`,
        createdAt: new Date().toISOString(),
        senderId: userInfo.userId,
      };

      setMessages((prev) => [newMessage, ...(prev || [])]);
      api
        .sendMessage({
          conversationId: newMessage.conversationId,
          content: newMessage.content,
        })
        .catch((error) => {
          console.error("Lỗi gửi tin nhắn:", error);
          alert("Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.");
        });
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
          <Text style={MessageScreenStyle.loadingText}>Loading...</Text>
        </View>
      )}
      <ChatFooter onSendMessage={handleSendMessage} />
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
