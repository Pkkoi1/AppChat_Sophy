import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import GroupStyle from "./GroupStyle"; // Import style từ file riêng

const getDayOfWeek = (date) => {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[date.getDay()];
};

const formatDate = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return getDayOfWeek(messageDate);
  } else {
    return messageDate.toLocaleDateString("vi-VN");
  }
};

const truncateText = (text, maxLength) => {
  if (!text || typeof text !== "string") return "Không có tin nhắn";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const Group = ({ name, avatar, message, date }) => {
  return (
    <TouchableOpacity
      onPress={() => console.log("Navigate to group chat: ", name)}
      activeOpacity={0.6}
      style={GroupStyle.container} // Áp dụng style từ GroupStyle.js
    >
      <Image source={{ uri: avatar }} style={GroupStyle.avatar} />

      <View style={GroupStyle.content}>
        {/* Hàng trên: Tên nhóm + Ngày */}
        <View style={GroupStyle.header}>
          <Text style={GroupStyle.groupName} numberOfLines={1}>
            {truncateText(name, 20)}
          </Text>
          <Text style={GroupStyle.date}>{formatDate(date)}</Text>
        </View>

        {/* Hàng dưới: Tin nhắn gần nhất */}
        <Text style={GroupStyle.message} numberOfLines={1}>
          {truncateText(message, 50)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Group;
