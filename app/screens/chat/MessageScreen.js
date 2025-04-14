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
  const [isLoadingMore, setIsLoadingMore] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);

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
    if (!conversation?.conversationId) {
      alert("Không thể gửi tin nhắn: Cuộc trò chuyện không tồn tại.");
      return;
    }

    const newMessage = {
      conversationId: conversation.conversationId, // Include conversationId
      content: message.content, // Include content
      messageDetailId: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      senderId: userInfo.userId,
    };

    setMessages((prev) => {
      const updatedMessages = [...(prev || []), newMessage].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      // .reverse(); // Sort messages by createdAt in descending order
      return updatedMessages;
    });
    // Send the message to the server
    api
      .sendMessage({
        conversationId: newMessage.conversationId,
        content: newMessage.content,
      })

      .catch((error) => {
        console.error("Lỗi gửi tin nhắn:", error);

        // Handle specific error cases
        if (error.message.includes("Conversation not found or access denied")) {
          alert(
            "Không thể gửi tin nhắn: Cuộc trò chuyện không tồn tại hoặc bạn không có quyền truy cập."
          );
        } else {
          alert("Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.");
        }
      });
  };

  useEffect(() => {
    if (!conversation?.conversationId) {
      console.error("Lỗi: Cuộc trò chuyện không tồn tại.");
      setMessages([]); // Clear messages if conversation is invalid
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await api.getMessages(conversation.conversationId);
        const { messages, nextCursor, hasMore } = response;

        setMessages(messages || []);
        setNextCursor(true);
        setHasMoreMessages(true);
      } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversation?.conversationId]);

  const loadMoreMessages = async () => {
    // setMessages([]);
    // if (isLoadingMore || !hasMoreMessages || !nextCursor) {
    //   console.log("Không thể tải thêm tin nhắn:");
    //   console.log("isLoadingMore:", isLoadingMore);
    //   console.log("hasMoreMessages:", hasMoreMessages);
    //   console.log("nextCursor:", nextCursor);
    //   return;
    // }

    console.log("Bắt đầu tải thêm tin nhắn...");
    setIsLoadingMore(true);

    // Lấy thời gian của tin nhắn cũ nhất
    const lastMessageTime = messages[0]?.createdAt;
    console.log("Thời gian của tin nhắn cũ nhất:", lastMessageTime);

    try {
      console.log("Gửi yêu cầu API với nextCursor:", nextCursor);
      const response = await api.getMessages(
        conversation.conversationId,
        lastMessageTime,
        "before", // load thêm tin cũ
        20
      );

      const {
        messages: moreMessages,
        nextCursor: newCursor,
        hasMore,
      } = response;

      console.log("Tin nhắn mới tải:", moreMessages);
      console.log("nextCursor mới:", newCursor);
      console.log("hasMore từ API:", hasMore);

      setMessages((prev) => {
        const updatedMessages = [...moreMessages, ...prev];
        console.log("Danh sách tin nhắn sau khi cập nhật:", updatedMessages);
        return updatedMessages;
      });

      setNextCursor(newCursor);
      setHasMoreMessages(hasMore);
    } catch (error) {
      console.error("Lỗi tải thêm tin nhắn:", error);
    } finally {
      setIsLoadingMore(false);
      console.log("Hoàn thành tải thêm tin nhắn.");
    }
  };
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
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={{ flex: 1 }}
      >
        {messages?.length > 0 ? (
          <Conversation
            conversation={{ messages }}
            senderId={userInfo.userId}
            highlightedMessageIds={highlightedMessageIds}
            highlightedMessageId={highlightedMessageId}
            searchQuery={searchQuery}
            flatListRef={flatListRef}
            receiver={receiver}
            keyboardShouldPersistTaps="handled" // Ensure taps don't dismiss the keyboard
            onLoadMoreMessages={loadMoreMessages}
            isLoadingMore={isLoadingMore}
          />
        ) : (
          <Text style={styles.emptyText}>Không có tin nhắn nào.</Text>
        )}
      </KeyboardAvoidingView>
      <ChatFooter onSendMessage={handleSendMessage} />
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
