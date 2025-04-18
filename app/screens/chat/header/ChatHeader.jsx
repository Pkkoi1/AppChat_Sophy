// export default ChatHeader;
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/app/api/api";

const ChatHeader = ({
  user_id,
  receiver,
  navigation,
  conversation,
  lastActiveStatus,
}) => {
  const [receiverName, setReceiverName] = useState("");
  const handlerBack = () => {
    navigation.goBack();
  };

  const handlerOptionScreen = () => {
    navigation.navigate("Options", {
      ...(conversation?.isGroup
        ? { conversation }
        : { receiver, conversation }),
    });
  };
  return (
    <LinearGradient
      colors={["#1f7bff", "#12bcfa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={ChatHeaderStyle.container}
    >
      <TouchableOpacity onPress={handlerBack}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={ChatHeaderStyle.conversationName}>
        <Text
          style={ChatHeaderStyle.text}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {conversation?.isGroup
            ? conversation.groupName || "Nhóm không tên"
            : receiver?.fullname || "Đang tải..."}
        </Text>
        <Text style={ChatHeaderStyle.subText}>
          {conversation?.isGroup
            ? `${conversation.groupMembers?.length || 0} thành viên`
            : lastActiveStatus || "Đang tải..."}
        </Text>
      </View>
      <TouchableOpacity>
        <Feather name="phone" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="videocam-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handlerOptionScreen}>
        <Ionicons name="menu-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const ChatHeaderStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  conversationName: {
    width: "45%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  text: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  subText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "300",
  },
});

export default ChatHeader;
