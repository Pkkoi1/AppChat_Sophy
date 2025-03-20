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
import conversations from "../../../assets/objects/conversation.json";
import MessageScreenStyle from "./MessageScreenStyle";
import moment from "moment";
import Fuse from "fuse.js";

const MessageScreen = ({ route, navigation }) => {
  const { conversation_id, user_id, startSearch } = route.params;
  const nav = useNavigation();

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(startSearch || false);
  const [highlightedMessageIds, setHighlightedMessageIds] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const flatListRef = useRef(null);
  const debounceSearch = useRef(null);

  useEffect(() => {
    const conversation = conversations.find(
      (conv) => conv.conversation_id === conversation_id
    );

    if (conversation) {
      const sortedMessages = (conversation.messages || []).sort((a, b) =>
        moment(a.timestamp).diff(moment(b.timestamp))
      );
      setMessages(sortedMessages);
      setParticipants(conversation.participants || []);
      setIsGroup(conversation.isGroup || false);
      if (conversation.isGroup) {
        setGroupName(conversation.groupName);
      }
      const receiver = conversation.participants.find((p) => p.id !== user_id);
      setReceiver(receiver);
    } else {
      console.warn("Không tìm thấy cuộc trò chuyện với ID:", conversation_id);
    }

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [conversation_id]);

  const handleSendMessage = (message) => {
    const lastMessage = messages[messages.length - 1];
    const isNewTimeGap =
      !lastMessage ||
      moment().diff(moment(lastMessage.timestamp), "minutes") >= 20;

    const newMessage = {
      message_id: `msg_${Date.now()}`,
      sender_id: user_id,
      receiver_id: receiver?.id || null,
      timestamp: new Date().toISOString(),
      ...message,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSearchMessages = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setHighlightedMessageIds([]);
      setCurrentSearchIndex(0);
      return;
    }

    const fuse = new Fuse(messages, {
      keys: ["content"], // Tìm kiếm theo trường "content" của tin nhắn
      threshold: 0.4, // Độ chính xác tìm kiếm (càng cao càng dễ khớp)
      distance: 100, // Khoảng cách tối đa giữa các ký tự
    });

    // Lấy kết quả tìm kiếm
    const results = fuse.search(query).map((result) => result.item);

    // Sắp xếp kết quả theo thứ tự giảm dần dựa trên timestamp
    const sortedResults = results.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Lấy danh sách message_id từ kết quả đã sắp xếp
    const sortedMessageIds = sortedResults.map((item) => item.message_id);

    setHighlightedMessageIds(sortedMessageIds);
    setCurrentSearchIndex(0);

    if (sortedMessageIds.length > 0) {
      console.log("Kết quả tìm kiếm (giảm dần):", sortedMessageIds);
      scrollToMessage(0); // Cuộn đến kết quả đầu tiên
    } else {
      console.log("Không tìm thấy tin nhắn khớp với từ khóa:", query);
    }
  };

  const scrollToMessage = (index) => {
    if (index >= 0 && index < highlightedMessageIds.length) {
      const messageId = highlightedMessageIds[index];
      const originalIndex = messages.findIndex(
        (msg) => msg.message_id === messageId
      );

      if (originalIndex !== -1) {
        const reversedIndex = messages.length - 1 - originalIndex;

        if (reversedIndex >= 0 && reversedIndex < messages.length) {
          setIsManualScroll(true); // Đặt trạng thái cuộn thủ công
          flatListRef.current?.scrollToIndex({
            index: reversedIndex,
            animated: true,
            viewPosition: 0.5, // Đặt tin nhắn ở giữa màn hình
          });

          // Highlight tin nhắn
          setHighlightedMessageId(messageId);


          console.log(`Scrolled to message at index: ${reversedIndex}`);
        } else {
          console.warn("Reversed index không hợp lệ:", reversedIndex);
        }
      } else {
        console.warn("Không tìm thấy messageId trong danh sách:", messageId);
      }
    } else {
      console.warn("Index không hợp lệ:", index);
    }
  };

  const handleSearchInput = (query) => {
    setSearchQuery(query);

    if (debounceSearch.current) {
      clearTimeout(debounceSearch.current);
    }

    debounceSearch.current = setTimeout(() => {
      handleSearchMessages(query);
    }, 1000); // Dừng 1 giây trước khi thực hiện tìm kiếm
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    setHighlightedMessageIds([]);
    setCurrentSearchIndex(0);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ebecf0" }}>
      {isSearching ? (
        <SearchHeader
          onCancel={handleCancelSearch}
          onSearch={handleSearchInput}
        />
      ) : (
        <ChatHeader
          receiver={receiver}
          groupName={groupName}
          participants={participants}
          isGroup={isGroup}
          user_id={user_id}
          conversation_id={conversation_id}
          onSearchPress={() => setIsSearching(true)}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={{ flex: 1 }}
      >
        {messages.length > 0 ? (
          <Conversation
            conversation={{ messages, participants }}
            senderId={user_id}
            highlightedMessageIds={highlightedMessageIds}
            highlightedMessageId={highlightedMessageId}
            searchQuery={searchQuery}
            flatListRef={flatListRef}
            isManualScroll={isManualScroll} // Truyền trạng thái cuộn thủ công
            setIsManualScroll={setIsManualScroll} // Truyền hàm cập nhật trạng thái
          />
        ) : (
          <Text style={styles.emptyText}>Không có tin nhắn nào.</Text>
        )}
      </KeyboardAvoidingView>
      {!isSearching && (
        <ChatFooter
          onSendMessage={handleSendMessage}
          style={MessageScreenStyle.chatFooter}
        />
      )}
      {isSearching && (
        <SearchFooter
          resultCount={highlightedMessageIds.length}
          currentIndex={currentSearchIndex}
          onNext={() => {
            if (currentSearchIndex > 0) {
              const prevIndex = currentSearchIndex - 1; // Chuyển thành cuộn lên
              setCurrentSearchIndex(prevIndex);
              scrollToMessage(prevIndex);
            }
          }}
          onPrevious={() => {
            if (currentSearchIndex < highlightedMessageIds.length - 1) {
              const nextIndex = currentSearchIndex + 1; // Chuyển thành cuộn xuống
              setCurrentSearchIndex(nextIndex);
              scrollToMessage(nextIndex);
            }
          }}
          disableNext={currentSearchIndex <= 0} // Vô hiệu hóa nút "Xuống" nếu ở đầu danh sách
          disablePrevious={
            currentSearchIndex >= highlightedMessageIds.length - 1
          } // Vô hiệu hóa nút "Lên" nếu ở cuối danh sách
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
