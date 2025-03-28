import React from "react";
import { View, Text, Image } from "react-native";
import moment from "moment";
import MessageItemStyle from "./MessageItemStyle";
import HighlightText from "../../../components/highlightText/HighlightText"; // Import HighlightText

const MessageItem = ({
  message,
  isSender,
  avatar,
  searchQuery,
  isHighlighted,
  receiverId,
}) => {
  const formattedTimestamp = moment(message.createdAt).format(
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
      {!isSender && (
        <Image
          source={{
            uri:
              // avatar ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHfn_ap7TA8_f2b-QWEdQWRTtlI8U5strBQ&s", // Đường dẫn hình ảnh mặc định
          }}
          style={MessageItemStyle.avatar}
        />
      )}

      <View
        style={[
          MessageItemStyle.messageBox,
          isSender ? MessageItemStyle.sender : MessageItemStyle.receiver,
          !isSender && avatar ? MessageItemStyle.receiverWithAvatar : {}, // Điều chỉnh nếu có avatar
        ]}
      >
        <Text style={MessageItemStyle.timestamp}>{formattedTimestamp}</Text>
        {/* <Text style={MessageItemStyle.timestamp}>{message.senderId}</Text> */}

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
