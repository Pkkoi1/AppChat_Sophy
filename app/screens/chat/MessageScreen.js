import React, { useState, useEffect, useRef, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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

  const handleSendMessage = (message) => {
    const newMessage = {
      ...message,
      messageDetailId: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(), // Gán thời gian gửi
    };

    setMessages((prev) => {
      const updatedMessages = [...(prev || []), newMessage].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      return updatedMessages;
    });

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.getMessages(conversation?.conversationId);
        const { messages, nextCursor, hasMore } = response; // Extract messages, nextCursor, and hasMore

        setMessages(messages || []); // Ensure messages is always an array
        // console.log("Tin nhắn:", messages);
        // console.log("Next cursor:", nextCursor);
        // console.log("Has more:", hasMore);
      } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        setMessages([]); // Fallback to an empty array on error
      }
    };
    fetchMessages();
  }, [conversation?.conversationId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setHighlightedMessageIds([]);
      setHighlightedMessageId(null);
      return;
    }

    const fuse = new Fuse(messages, {
      keys: ["content"],
      threshold: 0.6,
      distance: 100,
    });

    const results = fuse.search(searchQuery).map((res) => res.item);

    // Sắp xếp danh sách theo thời gian gửi
    const sortedResults = results.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const messageIds = sortedResults.map((msg) => msg.messageDetailId);
    setHighlightedMessageIds(messageIds);
    setCurrentSearchIndex(messageIds.length - 1); // Mặc định chọn tin nhắn cuối

    console.log("Danh sách ID tin nhắn tìm được:", messageIds);

    if (messageIds.length > 0) {
      scrollToMessage(messageIds.length - 1); // Cuộn đến tin nhắn cuối
    }
  }, [searchQuery, messages]);

  // Cuộn đến tin nhắn
  const scrollToMessage = (index) => {
    if (index < 0 || index >= highlightedMessageIds.length) return;

    const messageId = highlightedMessageIds[index];
    const messageIndex = messages.findIndex(
      (msg) => msg.messageDetailId === messageId
    );

    if (messageIndex !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: messageIndex,
          animated: true,
          viewPosition: 0.5,
        });
        setHighlightedMessageId(messageId); // Đánh dấu tin nhắn này
      }, 300);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ebecf0" }}>
      <ChatHeader
        navigation={navigation}
        receiver={receiver}
        conversation={conversation}
        lastActiveStatus={calculateLastActive(receiver?.lastActive)}
      />
      {isSearching && (
        <View style={StyleSheet.absoluteFill}>
          <SearchHeader
            onCancel={() => {
              setIsSearching(false);
              setSearchQuery("");
              setHighlightedMessageIds([]);
              setHighlightedMessageId(null);

              // 🔥 Chờ một chút để đảm bảo React cập nhật state trước khi render lại header
              setTimeout(() => {
                navigation.setParams({ receiver }); // Đảm bảo receiverId vẫn tồn tại
              }, 100);
            }}
            onSearch={setSearchQuery}
          />
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={{ flex: 1 }}
      >
        {/* <View style={MessageScreenStyle.container}>
          <Text style={MessageScreenStyle.title}>Tin nhắn</Text>
          <Text style={MessageScreenStyle.subtitle}>
            {receiver?.fullname || "Người dùng không xác định"}
          </Text>
        </View> */}
        {messages?.length > 0 ? (
          <Conversation
            conversation={{ messages }}
            senderId={userInfo.userId}
            highlightedMessageIds={highlightedMessageIds}
            highlightedMessageId={highlightedMessageId}
            searchQuery={searchQuery}
            flatListRef={flatListRef}
            receiver={receiver}
          />
        ) : (
          <Text style={styles.emptyText}>Không có tin nhắn nào.</Text>
        )}
      </KeyboardAvoidingView>

      <ChatFooter
        onSendMessage={(message) => {
          setMessages((prev) => [
            ...(prev || []),
            { ...message, messageDetailId: `msg_${Date.now()}` },
          ]);
        }}
      />
      {isSearching && (
        <View style={StyleSheet.absoluteFill}>
          <SearchFooter
            resultCount={highlightedMessageIds.length}
            currentIndex={currentSearchIndex}
            onNext={() => {
              setCurrentSearchIndex((prev) => {
                const nextIndex =
                  prev + 1 < highlightedMessageIds.length ? prev + 1 : prev; // Không xuống nếu là tin nhắn cuối
                scrollToMessage(nextIndex);
                return nextIndex;
              });
            }}
            onPrevious={() => {
              setCurrentSearchIndex((prev) => {
                const prevIndex = prev - 1 >= 0 ? prev - 1 : prev; // Không lên nếu là tin nhắn đầu
                scrollToMessage(prevIndex);
                return prevIndex;
              });
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
});

export default MessageScreen;
