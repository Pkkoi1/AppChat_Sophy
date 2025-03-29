import React, { useState, useEffect, useRef } from "react";
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
import ChatFooter from "./footer/ChatFooter";
import SearchHeader from "../optional/name/searchMessage/SearchHeader";
import SearchFooter from "../optional/name/searchMessage/SearchFooter";
import Conversation from "./message/Conversation";
import MessageScreenStyle from "./MessageScreenStyle";
import Fuse from "fuse.js";
import { api } from "../../../api/api";

const MessageScreen = ({ route, navigation }) => {
  const { conversation_id, user_id, startSearch, receiverId } = route.params;

  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(startSearch || false);
  const [highlightedMessageIds, setHighlightedMessageIds] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleSendMessage = (message) => {
    const newMessage = {
      ...message,
      messageDetailId: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(), // Gán thời gian gửi
    };

    setMessages((prev) => {
      const updatedMessages = [...prev, newMessage].sort(
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
        const response = await api.getMessages(conversation_id);
        const sortedMessages = response.data?.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages.reverse() || []);
      } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [conversation_id]);

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
      {isSearching ? (
        <SearchHeader
          onCancel={() => {
            setIsSearching(false);
            setSearchQuery("");
            setHighlightedMessageIds([]);
            setHighlightedMessageId(null);

            // 🔥 Chờ một chút để đảm bảo React cập nhật state trước khi render lại header
            setTimeout(() => {
              navigation.setParams({ receiverId }); // Đảm bảo receiverId vẫn tồn tại
            }, 100);
          }}
          onSearch={setSearchQuery}
        />
      ) : (
        <ChatHeader
          navigation={navigation}
          receiver={receiverId}
          user_id={user_id}
          conversation_id={conversation_id}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={{ flex: 1 }}
      >
        {messages.length > 0 ? (
          <Conversation
            conversation={{ messages }}
            senderId={user_id}
            highlightedMessageIds={highlightedMessageIds}
            highlightedMessageId={highlightedMessageId}
            searchQuery={searchQuery}
            flatListRef={flatListRef}
          />
        ) : (
          <Text style={styles.emptyText}>Không có tin nhắn nào.</Text>
        )}
      </KeyboardAvoidingView>

      {!isSearching ? (
        <ChatFooter
          onSendMessage={(message) => {
            setMessages((prev) => [
              ...prev,
              { ...message, messageDetailId: `msg_${Date.now()}` },
            ]);
          }}
        />
      ) : (
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
