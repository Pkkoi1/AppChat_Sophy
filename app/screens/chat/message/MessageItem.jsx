import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import moment from "moment";
import MessageItemStyle from "./MessageItemStyle";

const MessageItem = ({ message, isSender, avatar }) => {
  const formattedTimestamp = moment(message.timestamp).format(
    "DD/MM/YYYY HH:mm"
  );

  // Log the value of isSender for debugging
  console.log(`Message ID: ${message.message_id}, isSender: ${isSender}`);

  return (
    <View
      style={[
        MessageItemStyle.container,
        isSender
          ? MessageItemStyle.senderContainer
          : MessageItemStyle.receiverContainer,
      ]}
    >
      {!isSender && avatar && (
        <Image source={{ uri: avatar }} style={MessageItemStyle.avatar} />
      )}
      <View
        style={[
          MessageItemStyle.messageBox,
          isSender ? MessageItemStyle.sender : MessageItemStyle.receiver,
          !isSender && avatar
            ? MessageItemStyle.receiverWithAvatar
            : MessageItemStyle.receiverWithoutAvatar,
        ]}
      >
        <Text style={MessageItemStyle.timestamp}>{formattedTimestamp}</Text>
        <Text style={MessageItemStyle.content}>{message.content}</Text>
      </View>
    </View>
  );
};

export default MessageItem;
