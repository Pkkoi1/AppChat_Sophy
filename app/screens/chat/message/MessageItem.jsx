import React from "react";
import { View, Text, Image } from "react-native";
import moment from "moment";
import MessageItemStyle from "./MessageItemStyle";
import HighlightText from "../../../components/highlightText/HighlightText"; // Import HighlightText
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import AvatarUser from "@/app/components/profile/AvatarUser";

const MessageItem = ({
  message,
  isSender,
  searchQuery,
  isHighlighted,
  receiver,
}) => {
  const formattedTimestamp = moment(message.createdAt).format(
    "DD/MM/YYYY HH:mm"
  );

  const isGroup = !receiver; // Check if receiver is null, indicating a group

  const renderAvatar = async () => {
    if (isGroup) {
      try {
        const response = await fetchUserInfo(message.senderId); // Fetch sender info using senderId
        // console.log("Thông tin người gửi:", response);
        const sender = response;
        return sender?.urlavatar ? (
          <Image
            source={{ uri: sender.urlavatar }}
            style={MessageItemStyle.avatar}
          />
        ) : (
          <AvatarUser
            fullName={sender?.fullname || "User"}
            width={32}
            height={32}
            avtText={12}
            shadow={false}
            bordered={false}
          />
        );
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người gửi:", error);
        return (
          <AvatarUser
            fullName="User"
            width={32}
            height={32}
            avtText={12}
            shadow={false}
            bordered={false}
          />
        );
      }
    } else {
      return receiver?.urlavatar ? (
        <Image
          source={{ uri: receiver.urlavatar }}
          style={MessageItemStyle.avatar}
        />
      ) : (
        <AvatarUser
          fullName={receiver?.fullname || "User"}
          width={50}
          height={50}
          avtText={20}
          shadow={false}
          bordered={false}
        />
      );
    }
  };

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
        <View style={MessageItemStyle.avatarContainer}>{renderAvatar()}</View>
      )}
      <View
        style={[
          MessageItemStyle.messageBox,
          isSender ? MessageItemStyle.sender : MessageItemStyle.receiver,
          !isSender ? MessageItemStyle.receiverWithAvatar : {}, // Adjust if there are avatars
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
