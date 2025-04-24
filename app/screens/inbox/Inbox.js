import React, { useContext, useEffect, useState } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import RenderGroupAvatar from "@/app/components/group/RenderGroupAvatar";
import { AuthContext } from "@/app/auth/AuthContext";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { api } from "@/app/api/api";

const DEFAULT_AVATAR = "https://example.com/default-avatar.png"; // Replace with actual default avatar URL

const Inbox = ({ conversation }) => {
  const { userInfo, updateBackground, handlerRefresh } =
    useContext(AuthContext);

  const {
    groupName,
    groupAvatarUrl,
    lastMessage,
    conversationId,
    receiverId,
    isGroup,
    groupMembers,
    unreadCount, // Access unreadCount from conversation
  } = conversation;

  const navigation = useNavigation();
  const [receiver, setReceiver] = useState(null);
  const [senderName, setSenderName] = useState("");
  const [uid, setUid] = useState("");

  const getTimeDifference = (date) => {
    if (!date) return ""; // Handle null date

    const validDate = moment(new Date(date));
    if (!validDate.isValid()) {
      return "Ngày không hợp lệ";
    }

    const now = moment();
    const diffInSeconds = now.diff(validDate, "seconds");
    const diffInMinutes = now.diff(validDate, "minutes");
    const diffInHours = now.diff(validDate, "hours");
    const diffInDays = now.diff(validDate, "days");

    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return validDate.format("DD/MM/YY");
    }
  };

  const truncateMessage = (message, maxLength) => {
    if (!message) return ""; // Handle null message
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + "...";
    }
    return message;
  };

  const readMessage = async (conversationId) => {
    try {
      const response = await api.readMessage(conversationId);
      handlerRefresh();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const getMessageContent = () => {
    // if (!lastMessage) return "No messages yet";

    if (lastMessage.isRecall) {
      return "Đã thu hồi một tin nhắn";
    }

    switch (lastMessage.type) {
      case "ADD_MEMBER":
        return `${senderName} đã thêm thành viên mới`;
      case "REMOVE_MEMBER":
        return `${senderName} đã xóa một thành viên`;
      case "LEAVE_GROUP":
        return `${senderName} đã rời nhóm`;
      case "SET_OWNER":
        return `${senderName} đã trở thành chủ nhóm`;
      case "SET_CO_OWNER":
        return `${senderName} đã trở thành đồng chủ nhóm`;
      case "REMOVE_CO_OWNER":
        return `${senderName} đã bị xóa quyền đồng chủ nhóm`;
      case "UPDATE_GROUP_NAME":
        return `${senderName} đã cập nhật tên nhóm`;
      case "UPDATE_GROUP_AVATAR":
        return `${senderName} đã cập nhật ảnh đại diện nhóm`;
      case "UPDATE_GROUP_BACKGROUND":
        return `${senderName} đã cập nhật ảnh nền nhóm`;
      case "DELETE_GROUP":
        return `${senderName} đã xóa nhóm`;
      case "text":
        return truncateMessage(lastMessage.content || "No messages yet", 50);
      case "text-with-image":
        return `[Hình ảnh]`;
      case "file":
        return `[Tệp tin]`;
      case "video":
        return `[Video]`;
      case "image":
        return `[Hình ảnh]`;
      case "audio":
        return `[Tin nhắn thoại]`;
      case "sticker":
        return `đã gửi một nhãn dán`;
      case "location":
        return `đã chia sẻ vị trí`;
      default:
        return "Tin nhắn không được hỗ trợ";
    }
  };

  useEffect(() => {
    const getUserInfo = async (id) => {
      try {
        if (!isGroup) {
          const data = await fetchUserInfo(id);
          setReceiver(data);
        } else {
          setReceiver(conversation.groupMembers); // Set receiver as groupMembers for groups
        }
      } catch (error) {
        console.error("Error fetching receiver info:", error);
        setReceiver(isGroup ? conversation.groupMembers : {}); // Fallback for groups or individual
      }
    };

    const getUserIDOfConversation = async () => {
      try {
        if (!isGroup) {
          if (conversation?.creatorId === userInfo?.userId) {
            setUid(conversation?.receiverId);
          } else {
            setUid(conversation?.creatorId);
          }
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
        setUid(""); // Set id to an empty string to avoid errors
      }
    };

    const resolveSenderName = async () => {
      try {
        if (!lastMessage?.senderId) {
          setSenderName(""); // Không hiển thị tên nếu senderId là null
          return;
        }

        if (lastMessage.senderId === userInfo?.userId) {
          setSenderName("Bạn");
        } else {
          const senderInfo = await fetchUserInfo(lastMessage.senderId);
          setSenderName(senderInfo?.fullname || "Unknown");
        }
      } catch (error) {
        console.error("Error fetching sender info:", error);
        setSenderName("Unknown"); // Set senderName to a default value
      }
    };
    getUserIDOfConversation();

    getUserInfo(uid);
    resolveSenderName();
  }, [
    receiverId,
    groupName,
    lastMessage?.senderId,
    userInfo?.userId,
    uid,
    conversation?.creatorId,
    isGroup,
  ]);

  // Check if the current user has unread messages
  const userUnread = unreadCount?.find(
    (entry) => entry.userId === userInfo.userId
  );
  const hasUnreadMessages = userUnread?.count > 0;

  return (
    <TouchableOpacity
      onPress={() => {
        readMessage(conversationId); // Mark the message as read when pressed
        updateBackground(conversation?.background); // Update background before navigating
        navigation.navigate("Chat", {
          conversation: conversation,
          receiver: isGroup ? null : receiver,
        });
      }}
      activeOpacity={0.6}
      style={styles.container}
    >
      <View style={styles.avatarContainer}>
        {isGroup ? (
          groupAvatarUrl ? (
            <Image source={{ uri: groupAvatarUrl }} style={styles.avatar} />
          ) : (
            <RenderGroupAvatar members={groupMembers} />
          )
        ) : receiver?.urlavatar ? (
          <Image source={{ uri: receiver?.urlavatar }} style={styles.avatar} />
        ) : (
          <AvatarUser
            fullName={receiver?.fullname || "User"}
            width={50}
            height={50}
            avtText={20}
            shadow={false}
            bordered={false}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {isGroup ? groupName : receiver?.fullname || "Unknown"}
          </Text>
          <Text style={styles.time}>
            {getTimeDifference(lastMessage?.createdAt)}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.message,
              hasUnreadMessages && styles.unreadMessage, // Apply bold styling if unread
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lastMessage?.senderId
              ? `${senderName}: ${getMessageContent()}`
              : lastMessage?.isRecall
              ? "Đã thu hồi một tin nhắn"
              : lastMessage?.content || "Chưa có tin nhắn"}
          </Text>
          {hasUnreadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{userUnread.count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingLeft: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    backgroundColor: "white",
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    maxWidth: "70%",
    flexShrink: 1,
  },
  time: {
    color: "gray",
    fontSize: 12,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  message: {
    color: "gray",
    fontSize: 14,
    maxWidth: "80%",
  },
  unreadMessage: {
    fontWeight: "bold", // Bold styling for unread messages
    color: "black",
  },
  unreadBadge: {
    backgroundColor: "red",
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default Inbox;
