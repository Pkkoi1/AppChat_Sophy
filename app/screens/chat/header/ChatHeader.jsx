import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { api, initiateCall } from "@/app/api/api";
import { SocketContext } from "../../../socket/SocketContext";
import { AuthContext } from "@/app/auth/AuthContext";
import Color from "@/app/components/colors/Color";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";

const ChatHeader = ({
  user_id,
  receiver,
  navigation,
  conversation,
  lastActiveStatus,
}) => {
  const [receiverName, setReceiverName] = useState("");
  const { socket } = useContext(SocketContext);
  const { groupMember, setGroupMember } = useContext(AuthContext);

  const [groupMem, setGroupMem] = useState([]);
  // console.log("Danh sách thành viên nhóm:", groupMember);
  const handlerBack = () => {
    api.readMessage(conversation.conversationId);
    navigation.goBack();
  };

  useEffect(() => {
    const updateGroupMem = async () => {
      if (conversation?.isGroup && Array.isArray(conversation.groupMembers)) {
        // Nếu groupMembers là mảng id, fetch thông tin user
        const users = await Promise.all(
          conversation.groupMembers.map((id) => fetchUserInfo(id))
        );
        const members = users.filter(Boolean).map((u) => ({
          id: u.userId,
          fullName: u.fullname || "",
          urlAvatar: u.urlavatar || "",
          role:
            u.userId === ownerId
              ? "owner"
              : coOwnerIds.includes(u.userId)
              ? "co-owner"
              : "member",
        }));
        setGroupMem(members);
        setGroupMember(members);
      } else {
        setReceiverName(receiver?.fullname || "Đang tải...");
      }
    };
    updateGroupMem();
    console.log("Cập nhật danh sách thành viên nhóm:", groupMember);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, receiver]);

  const handlerOptionScreen = () => {
    navigation.navigate("Options", {
      ...(conversation?.isGroup
        ? { conversation }
        : { receiver, conversation }),
    });
  };

  // Hàm gọi thoại
  const handleVoiceCall = async () => {
    console.log("[handleVoiceCall] Bắt đầu gọi thoại");
    
    // Check if socket is available and connected
    if (!socket || !socket.connected) {
      console.log("[handleVoiceCall] Socket chưa kết nối");
      Alert.alert("Thông báo", "Đang kết nối... Vui lòng thử lại sau");
      return;
    }
    
    if (conversation?.isGroup) {
      console.log("[handleVoiceCall] Cuộc gọi nhóm chưa hỗ trợ");
      Alert.alert("Thông báo", "Tính năng gọi nhóm đang được phát triển");
      return;
    }

    if (!receiver || !receiver.userId) {
      console.log("[handleVoiceCall] Không có receiver hợp lệ", receiver);
      Alert.alert("Thông báo", "Không thể kết nối cuộc gọi lúc này");
      return;
    }

    try {
      console.log("[handleVoiceCall] Gọi initiateCall với:", {
        receiverId: receiver.userId,
        type: "audio",
      });
      
      const res = await api.initiateCall({
        receiverId: receiver.userId,
        type: "audio",
      });

      if (!res || !res.data) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      const callId = res.data.callId;
      if (!callId) {
        console.log("[handleVoiceCall] Không nhận được callId từ backend", res.data);
        Alert.alert("Lỗi", "Không nhận được callId từ server.");
        return;
      }

      // Thêm log để debug
      console.log("[handleVoiceCall] Điều hướng sang CallScreen với:", {
        callType: "voice",
        isVideo: false,
        receiver: receiver,
        conversationId: conversation.conversationId,
        calleeId: receiver.userId,
        callId,
        incoming: false,
      });

      navigation.navigate("CallScreen", {
        callType: "voice",
        isVideo: false,
        receiver: receiver,
        conversationId: conversation.conversationId,
        calleeId: receiver.userId,
        callId,
        incoming: false,
      });
    } catch (err) {
      console.log("[handleVoiceCall] Lỗi khi gọi initiateCall:", err, err?.response?.data);
      Alert.alert("Lỗi", "Không thể bắt đầu cuộc gọi. Vui lòng thử lại.");
    }
  };

  // Hàm gọi video
  const handleVideoCall = async () => {
    if (conversation?.isGroup) {
      Alert.alert("Thông báo", "Tính năng gọi nhóm đang được phát triển");
      return;
    }

    if (!receiver || !receiver.userId) {
      Alert.alert("Thông báo", "Không thể kết nối cuộc gọi lúc này");
      return;
    }

    try {
      // Gọi API backend để lấy callId
      const res = await initiateCall({
        receiverId: receiver.userId,
        type: "video",
      });
      const callId = res.data.callId;

      // Thêm log để debug
      console.log("[handleVideoCall] Điều hướng sang CallScreen với:", {
        callType: "video",
        isVideo: true,
        receiver: receiver,
        conversationId: conversation.conversationId,
        calleeId: receiver.userId,
        callId,
        incoming: false,
      });

      navigation.navigate("CallScreen", {
        callType: "video",
        isVideo: true,
        receiver: receiver,
        conversationId: conversation.conversationId,
        calleeId: receiver.userId,
        callId,
        incoming: false,
      });
    } catch (err) {
      Alert.alert("Lỗi", "Không thể bắt đầu cuộc gọi. Vui lòng thử lại.");
    }
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
        disabled={conversation?.isGroup || !receiver || !receiver.userId}
      >
        <Feather
          name="phone"
          size={24}
          color={conversation?.isGroup || !receiver || !receiver.userId ? "#cccccc" : "#ffffff"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleVideoCall}
        disabled={conversation?.isGroup || !receiver || !receiver.userId}
      >
        <Ionicons
          name="videocam-outline"
          size={24}
          color={conversation?.isGroup || !receiver || !receiver.userId ? "#cccccc" : "#ffffff"}
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
