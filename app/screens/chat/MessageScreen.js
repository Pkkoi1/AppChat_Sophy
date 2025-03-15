import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
} from "react-native";
import ChatHeader from "./header/ChatHeader";
import ChatFooter from "./footer/ChatFooter";
import Conversation from "./message/Conversation";
import conversations from "../../../assets/objects/conversation.json";
import MessageScreenStyle from "./MessageScreenStyle";
import moment from "moment";

const MessageScreen = ({ route }) => {
  const { conversation_id, user_id } = route.params;

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const conversation = conversations.find(
      (conv) => conv.conversation_id === conversation_id
    );

    if (conversation) {
      setMessages(conversation.messages || []);
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

    // Lắng nghe sự kiện bàn phím
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ebecf0" }}>
      <ChatHeader
        receiver={receiver}
        groupName={groupName}
        participants={participants}
      />
      <View style={MessageScreenStyle.conversationContainer}>
        {messages.length === 0 ? (
          <Text>Không có tin nhắn</Text>
        ) : (
          <Conversation
            conversation={{ messages, participants }}
            senderId={user_id}
            groupName={groupName}
          />
        )}
      </View>

      {/* Đảm bảo Footer không bị che bởi bàn phím */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ChatFooter
          onSendMessage={handleSendMessage}
          style={MessageScreenStyle.chatFooter}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessageScreen;
