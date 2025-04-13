import React, { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";
import moment from "moment";
import MessageItemStyle from "./MessageItemStyle";
import HighlightText from "../../../components/highlightText/HighlightText"; // Import HighlightText
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";

const MessageItem = ({
  message,
  isSender,
  searchQuery,
  isHighlighted,
  receiver,
}) => {
  const [members, setMembers] = useState([]);
  const formattedTimestamp = moment(message.createdAt).format(
    "DD/MM/YYYY HH:mm"
  );

  const isGroup = Array.isArray(receiver); // Check if the receiver is a group

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (isGroup && members.length === 0) {
        try {
          const membersData = await Promise.all(
            receiver.map(async (id) => {
              const response = await fetchUserInfo(id);
              return response?.data || null;
            })
          );
          setMembers(membersData.filter((member) => member !== null)); // Filter out null values
        } catch (error) {
          console.error("Error fetching group members:", error);
          setMembers([]); // Set to an empty array on error
        }
      }
    };

    fetchGroupMembers();
  }, [isGroup, receiver, members.length]);

  const renderAvatars = () => {
    if (isGroup) {
      // For groups, find the avatar of the sender
      const sender = members.find((member) => member === message.senderId);
      return (
        <Image
          source={{
            uri:
              sender?.urlavatar ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHfn_ap7TA8_f2b-QWEdQWRTtlI8U5strBQ&s", // Default avatar
          }}
          style={MessageItemStyle.avatar}
        />
      );
    } else {
      // For individual chats, use the receiver's avatar
      return (
        <Image
          source={{
            uri:
              receiver?.urlavatar ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHfn_ap7TA8_f2b-QWEdQWRTtlI8U5strBQ&s", // Default avatar
          }}
          style={MessageItemStyle.avatar}
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
        <View style={MessageItemStyle.avatarContainer}>{renderAvatars()}</View>
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
