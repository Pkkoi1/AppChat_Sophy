import React from "react";
import { View, Text, Image } from "react-native";
import moment from "moment";
import MessageItemStyle from "./MessageItemStyle";
import HighlightText from "../../../../components/highlightText/HighlightText"; // Import HighlightText

const MessageItem = ({
  message,
  isSender,
  avatar,
  searchQuery,
  isHighlighted,
}) => {
  const formattedTimestamp = moment(message.timestamp).format(
    "DD/MM/YYYY HH:mm"
  );

  return (
    <View
      style={[
        MessageItemStyle.container,
        isSender
          ? MessageItemStyle.senderContainer
          : MessageItemStyle.receiverContainer,
        isHighlighted && MessageItemStyle.highlighted,
      ]}
    >
      {!isSender && avatar && (
        <Image source={{ uri: avatar }} style={MessageItemStyle.avatar} />
      )}

      <View
        style={[
          MessageItemStyle.messageBox,
          isSender ? MessageItemStyle.sender : MessageItemStyle.receiver,
          !isSender && avatar ? MessageItemStyle.receiverWithAvatar : {}, // Điều chỉnh nếu có avatar
        ]}
      >
        <Text style={MessageItemStyle.timestamp}>{formattedTimestamp}</Text>
        <HighlightText
          text={message.content}
          highlight={searchQuery}
          style={MessageItemStyle.content}
        />
      </View>
    </View>
  );
};

export default MessageItem;
