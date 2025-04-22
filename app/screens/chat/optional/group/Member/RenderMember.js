import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import AvatarUser from "@/app/components/profile/AvatarUser";
import AntDesign from "@expo/vector-icons/AntDesign";
import GroupMemberOption from "../option/GroupMemberOption";
import { api } from "@/app/api/api";

const RenderMember = ({
  item,
  userInfo,
  userInfos,
  navigation,
  conversation,
}) => {
  const [isOptionVisible, setOptionVisible] = useState(false);
  const memberInfo = userInfos[item];
  const isCurrentUser = item === userInfo?.userId;
  const role =
    item === conversation?.rules.ownerId
      ? "Trường nhóm"
      : conversation?.rules.coOwnerIds.includes(item)
      ? "Nhóm phó"
      : "Thành viên";

  const renderAvatar = (userInfo, role) => {
    const fullName = userInfo?.fullname || "User";
    const url = userInfo?.urlavatar;

    return (
      <View style={styles.avatarContainer}>
        {url ? (
          <Image source={{ uri: url }} style={styles.avatar} />
        ) : (
          <AvatarUser
            fullName={fullName}
            width={40}
            height={40}
            avtText={16}
            shadow={false}
            bordered={false}
          />
        )}
        {(role === "Trường nhóm" || role === "Nhóm phó") && (
          <View style={styles.keyIconContainer}>
            <AntDesign
              name="key"
              size={12}
              color={role === "Trường nhóm" ? "yellow" : "white"}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </View>
        )}
      </View>
    );
  };

  const handleMemberClick = () => {
    if (isCurrentUser) {
      navigation.navigate("MyProfile"); // Navigate to MyProfile if it's the current user
    } else {
      setOptionVisible(true); // Open options for other members
    }
  };

  const handleCreateConversation = async () => {
    try {
      if (!memberInfo?.userId) {
        Alert.alert(
          "Lỗi",
          "Không thể tạo cuộc trò chuyện: Không có ID người dùng."
        );
        return;
      }

      // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
      try {
        const existingConversation = await api.getConversationById(
          memberInfo.conversationId
        );
        if (existingConversation) {
          // Nếu cuộc trò chuyện đã tồn tại, chuyển đến màn hình Chat với conversationId
          navigation.navigate("Chat", {
            conversation: existingConversation,
            receiver: memberInfo,
          });
          return;
        }
      } catch (error) {
        // Nếu không tìm thấy cuộc trò chuyện, tiếp tục tạo mới
        console.log("Cuộc trò chuyện không tồn tại, tạo mới:", error);
      }

      // Tạo cuộc trò chuyện mới nếu không tìm thấy cuộc trò chuyện cũ
      const conversation = await api.createConversation(memberInfo.userId);
      if (conversation?.conversationId) {
        navigation.navigate("Chat", {
          conversation: conversation,
          receiver: memberInfo,
        });
      } else {
        Alert.alert("Lỗi", "Không thể tạo cuộc trò chuyện.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo cuộc trò chuyện:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo cuộc trò chuyện.");
    }
  };

  const handleAction = (action) => {
    setOptionVisible(false);
    switch (action) {
      case "message":
        handleCreateConversation(); // Use the handleCreateConversation function
        break;
      case "viewProfile":
        navigation.navigate("UserProfile", { friend: memberInfo });
        break;
      case "promote":
        console.log("Promote to co-owner");
        break;
      case "block":
        console.log("Block member");
        break;
      case "remove":
        console.log("Remove from group");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <View style={styles.memberContainer} onTouchEnd={handleMemberClick}>
        {renderAvatar(memberInfo, role)}
        <View style={styles.infoContainer}>
          <Text style={styles.memberName}>
            {isCurrentUser ? "Bạn" : memberInfo?.fullname || "Không rõ"}
          </Text>
          <Text style={styles.memberRole}>{role}</Text>
        </View>
      </View>
      <GroupMemberOption
        isVisible={isOptionVisible}
        onClose={() => setOptionVisible(false)}
        memberInfo={memberInfo}
        onAction={handleAction}
      />
    </>
  );
};

const styles = StyleSheet.create({
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    cursor: "pointer",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  keyIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  memberRole: {
    fontSize: 14,
    color: "#555",
  },
});

export default RenderMember;
