import React, { useState, useEffect } from "react";
import { SafeAreaView, FlatList, View, Text } from "react-native";
import ChatHeader from "./header/Index";
import ChatFooter from "./footer/Index";
import MessageItem from "./message/index.jsx";
import conversations from "../../../assets/objects/conversation.json";

const MessageScreen = ({ route }) => {
  const { conversation_id } = route.params; // Nhận conversation_id từ route.params
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log("conversation_id:", conversation_id); // Kiểm tra giá trị conversation_id
    const conversation = conversations.find(
      (conv) => conv.conversation_id === conversation_id
    );

    if (conversation) {
      setMessages(conversation.messages);
    } else {
      console.log("Không tìm thấy cuộc trò chuyện với ID:", conversation_id);
    }
  }, [conversation_id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ebecf0" }}>
      <ChatHeader />
      <View style={{ flex: 1 }}>
        {messages.length === 0 ? (
          <Text>Không có tin nhắn</Text>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.message_id}
            renderItem={({ item }) => <MessageItem message={item} />}
          />
        )}
      </View>
      <ChatFooter />
    </SafeAreaView>
  );
};

export default MessageScreen;
