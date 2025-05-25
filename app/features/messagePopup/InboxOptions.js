import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";
import { Overlay } from "@rneui/themed";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { RadioButton } from "react-native-paper";

const InboxOptions = ({
  isGroup,
  conversation,
  onMute,
  onHide,
  onDelete,
  onClose,
  onRefresh,
}) => {
  const { userInfo, updateUserInfo } = useContext(AuthContext);

  const { rules, conversationId, groupMembers } = conversation;
  const isCreator = rules?.ownerId === userInfo?.userId;

  // State for owner transfer overlay
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [groupMemberList, setGroupMemberList] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Mở overlay chọn quyền nhóm trưởng khi rời nhóm
  const openOwnerTransfer = async () => {
    setLoadingMembers(true);
    setOverlayVisible(true);
    try {
      let members = [];
      if (Array.isArray(groupMembers)) {
        if (typeof groupMembers[0] === "string") {
          const users = await Promise.all(groupMembers.map((id) => fetchUserInfo(id)));
          members = users.filter(Boolean).map((u) => ({
            id: u.userId,
            fullName: u.fullname || "",
            urlAvatar: u.urlavatar || "",
            role:
              u.userId === rules?.ownerId
                ? "owner"
                : (rules?.coOwnerIds || []).includes(u.userId)
                ? "co-owner"
                : "member",
          }));
        } else {
          members = groupMembers;
        }
      }
      // Loại bỏ owner khỏi danh sách chọn
      const filtered = members.filter((m) => m.id !== rules?.ownerId);
      setGroupMemberList(filtered);
      setSelectedOwner(filtered[0]?.id || null);
    } catch (err) {
      setGroupMemberList([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const confirmLeaveGroup = async () => {
    // Nếu là nhóm trưởng thì yêu cầu chuyển quyền trước khi rời nhóm
    if (isGroup && isCreator) {
      openOwnerTransfer();
      return;
    }
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn rời nhóm không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            await api.leaveGroup(conversationId);
            Alert.alert("Thành công", "Bạn đã rời nhóm.");
            if (onRefresh) onRefresh();
            onClose();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể rời nhóm. Vui lòng thử lại sau.");
            console.error("Lỗi khi rời nhóm:", error);
          }
        },
      },
    ]);
  };

  const confirmDisbandGroup = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn giải tán nhóm không? Tất cả dữ liệu nhóm sẽ bị xóa.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              await api.deleteGroup(conversationId);
              Alert.alert("Thành công", "Nhóm đã được giải tán.");
              if (onRefresh) onRefresh(); // Gọi refresh
              onClose();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể giải tán nhóm. Vui lòng thử lại.");
              console.error("Lỗi khi giải tán nhóm:", error);
            }
          },
        },
      ]
    );
  };

  const handlePinConversation = async () => {
    try {
      const pinnedList = userInfo?.pinnedConversations || [];
      const isPinned = pinnedList.some(
        (pinned) => pinned.conversationId === conversationId
      );

      if (!isPinned && pinnedList.length >= 5) {
        Alert.alert(
          "Không thể ghim thêm",
          "Đã đạt giới hạn 5 cuộc trò chuyện được ghim."
        );
        return;
      }

      if (!isPinned) {
        // Ghim
        await api.pinConversation(conversationId);
        const newPinned = [
          ...pinnedList,
          { conversationId, pinnedAt: new Date().toISOString() },
        ];
        await updateUserInfo({ pinnedConversations: newPinned });
        Alert.alert("Thành công", "Cuộc trò chuyện đã được ghim.");
      } else {
        // Bỏ ghim
        await api.unPinConversation(conversationId);
        const newPinned = pinnedList.filter(
          (p) => p.conversationId !== conversationId
        );
        await updateUserInfo({ pinnedConversations: newPinned });
        Alert.alert("Thành công", "Đã bỏ ghim cuộc trò chuyện.");
      }
      onClose();
    } catch (error) {
      Alert.alert(
        "Lỗi",
        "Không thể thay đổi trạng thái ghim cuộc trò chuyện. Vui lòng thử lại sau."
      );
      console.error("Lỗi khi thay đổi trạng thái ghim cuộc trò chuyện:", error);
    }
  };

  const handleSetOwnerAndLeave = async () => {
    if (!selectedOwner) {
      Alert.alert("Lỗi", "Vui lòng chọn một thành viên để làm nhóm trưởng.");
      return;
    }
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn chuyển quyền nhóm trưởng cho thành viên này và rời nhóm không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              await api.addOwner(conversationId, selectedOwner);
              await api.leaveGroup(conversationId);
              Alert.alert("Thành công", "Bạn đã chuyển quyền và rời nhóm.");
              setOverlayVisible(false);
              if (onRefresh) onRefresh();
              onClose();
            } catch (error) {
              Alert.alert(
                "Lỗi",
                "Không thể chuyển quyền hoặc rời nhóm. Vui lòng thử lại sau."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.option} onPress={onMute}>
        <MaterialIcons name="notifications-off" size={24} color="#1b96fd" />
        <Text style={styles.optionText}>Tắt thông báo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onHide}>
        <Feather name="eye-off" size={24} color="#1b96fd" />
        <Text style={styles.optionText}>Ẩn</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onDelete}>
        <MaterialIcons name="delete" size={24} color="#ff4d4f" />
        <Text style={styles.optionText}>Xóa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={handlePinConversation}>
        <FontAwesome5
          name="thumbtack"
          size={24}
          color={
            userInfo?.pinnedConversations?.some(
              (pinned) => pinned.conversationId === conversationId
            )
              ? "#ff4d4f"
              : "#1b96fd"
          }
        />
        <Text style={styles.optionText}>
          {userInfo?.pinnedConversations?.some(
            (pinned) => pinned.conversationId === conversationId
          )
            ? "Bỏ ghim"
            : "Ghim"}
        </Text>
      </TouchableOpacity>
      {isGroup && (
        <>
          <TouchableOpacity style={styles.option} onPress={confirmLeaveGroup}>
            <MaterialIcons name="exit-to-app" size={24} color="#ff4d4f" />
            <Text style={styles.optionText}>Rời nhóm</Text>
          </TouchableOpacity>
          {isCreator && (
            <TouchableOpacity
              style={styles.option}
              onPress={confirmDisbandGroup}
            >
              <MaterialIcons name="group-off" size={24} color="#ff4d4f" />
              <Text style={styles.optionText}>Giải tán nhóm</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {/* Overlay chọn quyền nhóm trưởng khi rời nhóm */}
      {isGroup && (
        <Overlay
          isVisible={isOverlayVisible}
          onBackdropPress={() => setOverlayVisible(false)}
          overlayStyle={styles.overlayContainer}
        >
          <Text style={styles.overlayTitle}>
            Chọn thành viên để làm nhóm trưởng trước khi rời nhóm
          </Text>
          {loadingMembers ? (
            <Text style={styles.loadingText}>Đang tải danh sách thành viên...</Text>
          ) : (
            groupMemberList.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberItem}
                onPress={() => setSelectedOwner(member.id)}
              >
                <View style={styles.memberInfo}>
                  <View style={styles.avatarContainer}>
                    {member.urlAvatar ? (
                      <Image source={{ uri: member.urlAvatar }} style={styles.avatar} />
                    ) : (
                      <AvatarUser
                        fullName={member.fullName}
                        width={40}
                        height={40}
                        avtText={16}
                        shadow={false}
                        bordered={false}
                      />
                    )}
                  </View>
                  <View>
                    <Text style={styles.memberName}>{member.fullName}</Text>
                    <Text style={styles.memberRole}>
                      {member.role === "co-owner"
                        ? "Phó nhóm"
                        : member.role === "member"
                        ? "Thành viên"
                        : member.role}
                    </Text>
                  </View>
                </View>
                <RadioButton
                  value={member.id}
                  status={selectedOwner === member.id ? "checked" : "unchecked"}
                  onPress={() => setSelectedOwner(member.id)}
                />
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleSetOwnerAndLeave}
          >
            <Text style={styles.confirmButtonText}>Chọn và rời nhóm</Text>
          </TouchableOpacity>
        </Overlay>
      )}
      <TouchableOpacity
        style={[styles.option, styles.closeOption]}
        onPress={onClose}
      >
        <Feather name="x" size={24} color="#888" />
        <Text style={styles.optionText}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    width: "90%",
    alignSelf: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    marginLeft: 15,
    fontSize: 13,
    color: "#333",
    fontWeight: "400",
  },
  closeOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  overlayContainer: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    marginVertical: 10,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  memberRole: {
    fontSize: 12,
    color: "#666",
  },
  confirmButton: {
    backgroundColor: "#1b96fd",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default InboxOptions;
