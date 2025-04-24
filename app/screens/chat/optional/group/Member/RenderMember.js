import React, { useState, useCallback } from "react";
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
  onConversationUpdate,
}) => {
  const [isOptionVisible, setOptionVisible] = useState(false);
  const memberInfo = userInfos[item];
  const isCurrentUser = item === userInfo?.userId;
  const role =
    item === conversation?.rules.ownerId
      ? "Trường nhóm"
      : conversation?.rules.coOwnerIds.includes(item)
      ? "Phó nhóm"
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
        {(role === "Trường nhóm" || role === "Phó nhóm") && (
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

  const handleAction = useCallback(
    async (action) => {
      setOptionVisible(false);
      switch (action) {
        case "message":
          handleCreateConversation(); // Use the handleCreateConversation function
          break;
        case "viewProfile":
          navigation.navigate("UserProfile", { friend: memberInfo });
          break;
        case "promote":
          Alert.alert(
            "Xác nhận",
            `Bạn có chắc chắn muốn bổ nhiệm ${
              memberInfo?.fullname || "thành viên"
            } làm nhóm phó không?`,
            [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    await api.promoteToCoOwner(
                      conversation.conversationId,
                      memberInfo.userId
                    );
                    Alert.alert(
                      "Thành công",
                      "Đã bổ nhiệm thành viên làm nhóm phó."
                    );

                    // Refresh the data after promotion
                    const updatedConversation = await api.getConversationById(
                      conversation.conversationId
                    );
                    if (updatedConversation) {
                      onConversationUpdate(updatedConversation);
                    }
                  } catch (error) {
                    Alert.alert(
                      "Lỗi",
                      "Không thể bổ nhiệm thành viên làm nhóm phó."
                    );
                  }
                },
              },
            ]
          );
          break;
        case "removeCoOwner":
          Alert.alert(
            "Xác nhận",
            `Bạn có chắc chắn muốn xóa vai trò nhóm phó của ${
              memberInfo?.fullname || "thành viên"
            } không?`,
            [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    await api.removeCoOwner(
                      conversation.conversationId,
                      memberInfo.userId
                    );
                    Alert.alert(
                      "Thành công",
                      "Đã xóa vai trò nhóm phó của thành viên."
                    );

                    // Refresh the data after role removal
                    const updatedConversation = await api.getConversationById(
                      conversation.conversationId
                    );
                    if (updatedConversation) {
                      onConversationUpdate(updatedConversation);
                    }
                  } catch (error) {
                    Alert.alert(
                      "Lỗi",
                      "Không thể xóa vai trò nhóm phó của thành viên."
                    );
                  }
                },
              },
            ]
          );
          break;
        case "block":
          Alert.alert(
            "Xác nhận",
            `Bạn có chắc chắn muốn chặn ${
              memberInfo?.fullname || "thành viên"
            } khỏi nhóm không?`,
            [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Chặn",
                style: "destructive",
                onPress: async () => {
                  try {
                    await api.blockUserFromGroup(
                      conversation.conversationId,
                      memberInfo.userId
                    );
                    Alert.alert(
                      "Thành công",
                      `Đã chặn ${
                        memberInfo?.fullname || "thành viên"
                      } khỏi nhóm.`
                    );

                    // Refresh the data after blocking
                    const updatedConversation = await api.getConversationById(
                      conversation.conversationId
                    );
                    if (updatedConversation) {
                      onConversationUpdate(updatedConversation);
                    }
                  } catch (error) {
                    Alert.alert("Lỗi", "Không thể chặn thành viên.");
                  }
                },
              },
            ]
          );
          break;
        case "remove":
          Alert.alert(
            "Xác nhận",
            `Bạn có chắc chắn muốn xóa ${
              memberInfo?.fullname || "thành viên"
            } khỏi nhóm không?`,
            [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                  try {
                    await api.removeUserFromGroup(
                      conversation.conversationId,
                      memberInfo.userId
                    );
                    Alert.alert(
                      "Thành công",
                      `Đã xóa ${
                        memberInfo?.fullname || "thành viên"
                      } khỏi nhóm.`
                    );

                    // Refresh the data after removing
                    const updatedConversation = await api.getConversationById(
                      conversation.conversationId
                    );
                    if (updatedConversation) {
                      onConversationUpdate(updatedConversation);
                    }
                  } catch (error) {
                    Alert.alert("Lỗi", "Không thể xóa thành viên khỏi nhóm.");
                  }
                },
              },
            ]
          );
          break;
        default:
          break;
      }
    },
    [conversation, memberInfo, navigation, onConversationUpdate]
  );

  const getAvailableActions = useCallback(() => {
    const actions = ["viewProfile", "message"]; // Always include viewProfile and message

    if (userInfo?.userId === conversation?.rules.ownerId) {
      // If the user is the group owner
      if (role === "Phó nhóm") {
        actions.push("removeCoOwner", "block", "remove"); // Only allow removing co-owner role
      } else if (role === "Thành viên") {
        actions.push("promote", "block", "remove"); // Allow promoting and other actions for regular members
      }
    } else if (conversation?.rules.coOwnerIds.includes(userInfo?.userId)) {
      // If the user is a co-owner
      if (role !== "Trường nhóm" && role !== "Phó nhóm") {
        actions.push("block", "remove"); // Allow limited actions for regular members
      }
    }

    return actions;
  }, [userInfo?.userId, conversation?.rules, role]);

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
        isCoOwner={conversation?.rules.coOwnerIds.includes(item)} // Corrected to use `item` instead of `memberInfo.userId`
        availableActions={getAvailableActions()} // Pass available actions based on role
      />
    </>
  );
};

const styles = StyleSheet.create({
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
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