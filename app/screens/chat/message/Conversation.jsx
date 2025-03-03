import React from "react";
import { View, FlatList } from "react-native";
import MessageItem from "./index";

const ConversationScreen = ({ conversation, senderId }) => {
  const filteredMessages = conversation.messages.filter(
    (message) => message.sender_id === senderId
  );

  return (
    <View>
      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.message_id}
        renderItem={({ item }) => <MessageItem message={item} />}
      />
    </View>
  );
};

export default ConversationScreen;
