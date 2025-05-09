import React, { useState, useCallback, useContext } from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import AvatarUser from "@/app/components/profile/AvatarUser";
import AntDesign from "@expo/vector-icons/AntDesign";
import GroupMemberOption from "../../option/GroupMemberOption";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import { navigateToProfile } from "@/app/utils/profileNavigation";

const RenderMember = ({
  item,
  userInfo,
  navigation,
  conversation,
  onConversationUpdate,
}) => {
  const [isOptionVisible, setOptionVisible] = useState(false);
  const { groupMember, changeRole, removeGroupMember } =
    useContext(AuthContext);

  // Lấy thông tin thành viên từ groupMember dựa trên id
  const memberInfo = groupMember.find((member) => member.id === item);
  // console.log("Member Info:", memberInfo);
  const isCurrentUser = item === userInfo?.userId;

  const fetchUserInfoById = async (id) => {
    try {
      const res = await fetchUserInfo(id);
      console.log("User Info:", res);
      return res;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null; // Trả về null nếu có lỗi
    }
  };

  // Xác định vai trò
  const role =
    memberInfo?.role === "owner"
      ? "Trưởng nhóm"
      : memberInfo?.role === "co-owner"
      ? "Phó nhóm"
      : "Thành viên";

  const renderAvatar = (memberInfo, role) => {
    const fullName = memberInfo?.fullName || "User";
    const url = memberInfo?.urlAvatar;

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
        {(role === "Trưởng nhóm" || role === "Phó nhóm") && (
          <View style={styles.keyIconContainer}>
            <AntDesign
              name="key"
              size={12}
              color={role === "Trưởng nhóm" ? "yellow" : "white"}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </View>
        )}
      </View>
    );
  };

  const handleMemberClick = () => {
    if (isCurrentUser) {
      navigation.navigate("MyProfile");
    } else {
      setOptionVisible(true);
    }
  };

  const handleCreateConversation = async () => {
    try {
      if (!memberInfo?.id) {
        Alert.alert(
          "Lỗi",
          "Không thể tạo cuộc trò chuyện: Không có ID người dùng."
        );
        return;
      }

      try {
        const existingConversation = await api.getConversationById(
          conversation.conversationId
        );
        if (existingConversation) {
          navigation.navigate("Chat", {
            conversation: existingConversation,
            receiver: { userId: memberInfo.id, fullName: memberInfo.fullName },
          });
          return;
        }
      } catch (error) {
        console.log("Cuộc trò chuyện không tồn tại, tạo mới:", error);
      }

      const conversation = await api.createConversation(memberInfo.id);
      if (conversation?.conversationId) {
        navigation.navigate("Chat", {
          conversation: conversation,
          receiver: { userId: memberInfo.id, fullName: memberInfo.fullName },
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
          handleCreateConversation();
          break;
        case "viewProfile":
          try {
            const friendInfo = await fetchUserInfoById(memberInfo.id);
            await navigateToProfile(navigation, friendInfo);
          } catch (error) {
            console.error("Lỗi khi lấy thông tin bạn bè:", error);
            Alert.alert("Lỗi", "Không thể lấy thông tin bạn bè.");
          }
          break;
        case "promote":
          Alert.alert(
            "Xác nhận",
            `Bạn có chắc chắn muốn bổ nhiệm ${
              memberInfo?.fullName || "thành viên"
            } làm nhóm phó không?`,
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    await api.promoteToCoOwner(
                      conversation.conversationId,
                      memberInfo.id
                    );
                    changeRole(
                      conversation.conversationId,
                      memberInfo.id,
                      "co-owner"
                    );
                    Alert.alert(
                      "Thành công",
                      "Đã bổ nhiệm thành viên làm nhóm phó."
                    );
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
              memberInfo?.fullName || "thành viên"
            } không?`,
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    await api.removeCoOwner(
                      conversation.conversationId,
                      memberInfo.id
                    );
                    changeRole(
                      conversation.conversationId,
                      memberInfo.id,
                      "member"
                    );
                    Alert.alert(
                      "Thành công",
                      "Đã xóa vai trò nhóm phó của thành viên."
                    );
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
              memberInfo?.fullName || "thành viên"
            } khỏi nhóm không?`,
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Chặn",
                style: "destructive",
                onPress: async () => {
                  try {
                    await api.blockUserFromGroup(
                      conversation.conversationId,
                      memberInfo.id
                    );
                    removeGroupMember(
                      conversation.conversationId,
                      memberInfo.id
                    );
                    Alert.alert(
                      "Thành công",
                      `Đã chặn ${
                        memberInfo?.fullName || "thành viên"
                      } khỏi nhóm.`
                    );
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
              memberInfo?.fullName || "thành viên"
            } khỏi nhóm không?`,
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                  try {
                    await api.removeUserFromGroup(
                      conversation.conversationId,
                      memberInfo.id
                    );
                    removeGroupMember(
                      conversation.conversationId,
                      memberInfo.id
                    );
                    Alert.alert(
                      "Thành công",
                      `Đã xóa ${
                        memberInfo?.fullName || "thành viên"
                      } khỏi nhóm.`
                    );
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
    const actions = ["viewProfile", "message"];
    const currentUserRole = groupMember.find(
      (m) => m.id === userInfo?.userId
    )?.role;

    if (currentUserRole === "owner") {
      if (role === "Phó nhóm") {
        actions.push("removeCoOwner", "block", "remove");
      } else if (role === "Thành viên") {
        actions.push("promote", "block", "remove");
      }
    } else if (currentUserRole === "rored coowner") {
      if (role === "Thành viên") {
        actions.push("block", "remove");
      }
    }

    return actions;
  }, [userInfo?.userId, groupMember, role]);

  return (
    <>
      <View style={styles.memberContainer} onTouchEnd={handleMemberClick}>
        {renderAvatar(memberInfo, role)}
        <View style={styles.infoContainer}>
          <Text style={styles.memberName}>
            {isCurrentUser ? "Bạn" : memberInfo?.fullName || "Không rõ"}
          </Text>
          <Text style={styles.memberRole}>{role}</Text>
        </View>
      </View>
      <GroupMemberOption
        isVisible={isOptionVisible}
        onClose={() => setOptionVisible(false)}
        memberInfo={memberInfo}
        onAction={handleAction}
        isCoOwner={role === "Phó nhóm"}
        availableActions={getAvailableActions()}
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
