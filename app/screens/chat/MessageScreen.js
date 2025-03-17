import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
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
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(startSearch || false);
  const flatListRef = useRef(null);

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

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredMessages([]);
      flatListRef.current?.scrollToEnd({ animated: true });
      return;
    }

    const fuse = new Fuse(messages, {
      keys: ["content"],
      threshold: 0.3, // Điều chỉnh mức độ chính xác của tìm kiếm
    });

    const results = fuse.search(query).map((result) => result.item);

    console.log("Kết quả tìm kiếm:", results);
    console.log("Từ khóa tìm kiếm:", query);

    setFilteredMessages(results);

    if (results.length > 0) {
      // Sắp xếp các kết quả tìm kiếm theo thứ tự tăng dần của timestamp
      const sortedResults = results.sort((a, b) =>
        moment(a.timestamp).diff(moment(b.timestamp))
      );

      // Lấy ID của tin nhắn mới nhất trong kết quả tìm kiếm
      const latestMessageId =
        sortedResults[sortedResults.length - 1].message_id;

      const index = messages.findIndex(
        (msg) => msg.message_id === latestMessageId
      );

      if (index >= 0 && index < messages.length) {
        flatListRef.current?.scrollToIndex({
          index: index,
          animated: true,
        });
      } else {
        console.warn("Chỉ mục cuộn nằm ngoài phạm vi của danh sách");
      }
    } else {
      console.warn("Không tìm thấy kết quả phù hợp.");
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };
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

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    setFilteredMessages([]);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ebecf0" }}>
      {isSearching ? (
        <SearchHeader onSearch={handleSearch} onCancel={handleCancelSearch} />
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
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()} // Đảo ngược thứ tự tin nhắn
          keyExtractor={(item) => item.message_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
            // onPress={() =>
            //   nav.navigate("ChatDetails", { messageId: item.message_id })
            // }
            >
              <Conversation
                conversation={{ messages: [item], participants }}
                senderId={user_id}
                groupName={groupName}
                searchQuery={searchQuery}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có tin nhắn</Text>
          }
          inverted
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ paddingTop: 40 }}
        />
      </KeyboardAvoidingView>
      {!isSearching && (
        <ChatFooter
          onSendMessage={handleSendMessage}
          style={MessageScreenStyle.chatFooter}
        />
      )}
      {isSearching && <SearchFooter resultCount={filteredMessages.length} />}
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
