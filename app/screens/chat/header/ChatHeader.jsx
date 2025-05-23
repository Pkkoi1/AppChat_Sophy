import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/app/api/api";
import { SocketContext } from "../../../socket/SocketContext";
import { AuthContext } from "@/app/auth/AuthContext";
import Color from "@/app/components/colors/Color";

const ChatHeader = ({
  user_id,
  receiver,
  navigation,
  conversation,
  lastActiveStatus,
}) => {
  const [receiverName, setReceiverName] = useState("");
  const socket = useContext(SocketContext);
  const { groupMember } = useContext(AuthContext);

  const handlerBack = () => {
    navigation.goBack();
    socket.on("newMessage");
    socket.on("groupAvatarChanged");
    socket.on("newConversation");
    socket.on("groupNameChanged");
    socket.on("userJoinedGroup");
    socket.on("userAddedToGroup");
    socket.on("userLeftGroup");
    socket.on("userRemovedFromGroup");
    socket.on("groupOwnerChanged");
    socket.on("groupCoOwnerAdded");
    socket.on("groupCoOwnerRemoved");
    socket.on("groupDeleted");
    socket.on("userBlocked");
    socket.on("userUnblocked");
    api.readMessage(conversation.conversationId);
  };

  const handlerOptionScreen = () => {
    navigation.navigate("Options", {
      ...(conversation?.isGroup
        ? { conversation }
        : { receiver, conversation }),
    });
  };

  // Hàm gọi thoại
  const handleVoiceCall = () => {
    // navigation.navigate("CallScreen", {
    //   callType: "voice",
    //   user: receiver,
    //   incoming: false,
    // });
  };

  // Hàm gọi video
  const handleVideoCall = () => {
    // navigation.navigate("CallScreen", {
    //   callType: "video",
    //   user: receiver,
    //   incoming: false,
    // });
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
            ? `${groupMember?.length || 0} thành viên`
            : lastActiveStatus || "Đang tải..."}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleVoiceCall}
        disabled={conversation?.isGroup}
      >
        <Feather
          name="phone"
          size={24}
          color={conversation?.isGroup ? "#ffffff" : "#ffffff"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleVideoCall}
        disabled={conversation?.isGroup}
      >
        <Ionicons
          name="videocam-outline"
          size={24}
          color={conversation?.isGroup ? "#ffffff" : "#ffffff"}
        />
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
