import {
  Ionicons,
  AntDesign,
  SimpleLineIcons,
  Feather,
} from "@expo/vector-icons";
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import Colors from "../../../../components/colors/Color";
import { api } from "@/app/api/api";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "@/app/auth/AuthContext";
import { Overlay } from "@rneui/themed"; // Import Overlay from RNEUI
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import { RadioButton } from "react-native-paper"; // Import RadioButton from react-native-paper
import AvatarUser from "@/app/components/profile/AvatarUser"; // Import AvatarUser

const options = [
  {
    name: "Báo xấu",
    icon: <AntDesign name="warning" size={20} color={Colors.gray} />,
    includeGroup: true,
    isGroup: true,
    color: "black",
  },
  {
    name: "Quản lý chặn",
    icon: <Ionicons name="ban-outline" size={20} color={Colors.gray} />,
    includeGroup: false,
    isGroup: false,
    color: "black",
  },
  {
    name: "Dung lượng trò chuyện",
    icon: <Ionicons name="pie-chart-outline" size={20} color={Colors.gray} />,
    includeGroup: true,
    isGroup: true,
    color: "black",
  },
  {
    name: "Xóa lịch sử trò chuyện",
    icon: <SimpleLineIcons name="trash" size={20} color="red" />,
    includeGroup: true,
    isGroup: true,
    color: "red",
  },
  {
    name: "Rời nhóm",
    icon: <Feather name="log-out" size={20} color="red" />,
    includeGroup: true,
    isGroup: true,
    color: "red",
  },
  {
    name: "Giải tán nhóm",
    icon: <AntDesign name="delete" size={20} color="red" />,
    includeGroup: true,
    isGroup: true,
    color: "red",
    ownerOnly: true, // Add a flag to indicate this option is for the owner only
  },
];

const BanAndRemoveOption = ({ conversation, receiver }) => {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const isOwner = conversation.rules.ownerId === userInfo.userId; // Check if the user is the group owner

  const fetchGroupMembers = async () => {
    setLoadingMembers(true);
    try {
      if (conversation && conversation.groupMembers) {
        const detailedMembers = await Promise.all(
          conversation.groupMembers.map(async (memberId) => {
            const memberInfo = await fetchUserInfo(memberId); // Fetch detailed user info
            const role =
              memberId === conversation.rules.ownerId
                ? "Trường nhóm"
                : conversation.rules.coOwnerIds.includes(memberId)
                ? "Phó nhóm"
                : "Thành viên"; // Determine the role
            return {
              userId: memberId,
              fullname: memberInfo?.fullname || "Không rõ",
              urlavatar: memberInfo?.urlavatar || null,
              role, // Store the role locally
            };
          })
        );

        // Filter out the current user
        const filteredMembers = detailedMembers.filter(
          (member) => member.userId !== userInfo.userId
        );

        // Default to a co-owner if available
        const defaultOwner =
          filteredMembers.find((member) => member.role === "Phó nhóm") ||
          filteredMembers[0]; // Fallback to the first member if no co-owner exists
        setSelectedOwner(defaultOwner?.userId);
        setGroupMembers(filteredMembers);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý danh sách thành viên nhóm:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải danh sách thành viên. Vui lòng thử lại."
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSetOwner = async () => {
    if (!selectedOwner) {
      Alert.alert("Lỗi", "Vui lòng chọn một thành viên để làm nhóm trưởng.");
      return;
    }

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn chuyển quyền nhóm trưởng cho thành viên này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              confirmLeaveGroup(true); // Pass true to indicate ownership transfer
            } catch (error) {
              Alert.alert(
                "Lỗi",
                "Không thể chuyển quyền nhóm trưởng. Vui lòng thử lại sau."
              );
              console.error("Lỗi khi chuyển quyền nhóm trưởng:", error);
            }
          },
        },
      ]
    );
  };

  const confirmLeaveGroup = async (transferOwnership = false) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn rời nhóm không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            if (transferOwnership) {
              await api.addOwner(conversation.conversationId, selectedOwner);
              Alert.alert("Thành công", "Quyền nhóm trưởng đã được chuyển.");
            }
            await api.leaveGroup(conversation.conversationId);
            Alert.alert("Thành công", "Bạn đã rời nhóm.");
            navigation.goBack();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể rời nhóm. Vui lòng thử lại sau.");
            console.error("Lỗi khi rời nhóm:", error);
          }
        },
      },
    ]);
  };

  const renderMember = (member) => {
    const { userId, fullname, role, urlavatar } = member;

    const renderAvatar = (fullname, url, role) => (
      <View style={styles.avatarContainer}>
        {url ? (
          <Image source={{ uri: url }} style={styles.avatar} />
        ) : (
          <AvatarUser
            fullName={fullname}
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

    return (
      <TouchableOpacity
        key={userId}
        style={styles.memberItem}
        onPress={() => setSelectedOwner(userId)}
      >
        <View style={styles.memberInfo}>
          {renderAvatar(fullname, urlavatar, role)}
          <View>
            <Text style={styles.memberName}>{fullname}</Text>
            <Text style={styles.memberRole}>{role}</Text>
          </View>
        </View>
        <RadioButton
          value={userId}
          status={selectedOwner === userId ? "checked" : "unchecked"}
          onPress={() => setSelectedOwner(userId)}
        />
      </TouchableOpacity>
    );
  };

  const handleOptionPress = async (optionName) => {
    if (optionName === "Rời nhóm") {
      if (isOwner) {
        await fetchGroupMembers(); // Fetch group members before showing the overlay
        setOverlayVisible(true);
      } else {
        confirmLeaveGroup(); // No ownership transfer needed
      }
    } else if (optionName === "Giải tán nhóm") {
      if (isOwner) {
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
                  await api.deleteGroup(conversation.conversationId); // Call API to delete the group
                  Alert.alert("Thành công", "Nhóm đã được giải tán.");
                  navigation.goBack(); // Navigate back after dissolving the group
                } catch (error) {
                  Alert.alert(
                    "Lỗi",
                    "Không thể giải tán nhóm. Vui lòng thử lại."
                  );
                  console.error("Lỗi khi giải tán nhóm:", error);
                }
              },
            },
          ]
        );
      }
    } else {
      console.log(`Option "${optionName}" selected.`);
    }
  };

  return (
    <View style={styles.container}>
      {options
        .filter((option) => option.includeGroup || !conversation?.isGroup)
        .filter((option) => option.name !== "Rời nhóm" || conversation?.isGroup)
        .filter((option) => !option.ownerOnly || isOwner) // Show owner-only options only if the user is the owner
        .map((option, index) => (
          <TouchableOpacity
            style={styles.optionButton}
            key={index}
            onPress={() => handleOptionPress(option.name)}
          >
            <View style={styles.iconContainer}>{option.icon}</View>
            <View style={styles.textContainer}>
              <Text style={[styles.optionText, { color: option.color }]}>
                {option.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

      <Overlay
        isVisible={isOverlayVisible}
        onBackdropPress={() => setOverlayVisible(false)}
        overlayStyle={styles.overlayContainer}
      >
        <Text style={styles.overlayTitle}>
          Chọn thành viên để làm nhóm trưởng
        </Text>
        {loadingMembers ? (
          <Text style={styles.loadingText}>
            Đang tải danh sách thành viên...
          </Text>
        ) : (
          groupMembers.map(renderMember)
        )}
        <TouchableOpacity style={styles.confirmButton} onPress={handleSetOwner}>
          <Text style={styles.confirmButtonText}>Chọn và tiếp tục</Text>
        </TouchableOpacity>
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 0,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: "#fff",
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 24,
    paddingTop: 16,
  },
  iconContainer: {
    marginRight: 20,
    paddingBottom: 10,
  },
  textContainer: {
    borderBottomWidth: 0.4,
    borderBottomColor: "#ddd",
    paddingBottom: 16,
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
  },
  overlayContainer: {
    width: "90%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  memberItem: {
    padding: 12,

    flexDirection: "row",
    alignItems: "center",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  memberName: {
    fontSize: 16,
    color: "#000",
  },
  memberRole: {
    fontSize: 14,
    color: "#555",
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 16,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
    backgroundColor: Colors.sophy,
    padding: 8,
    borderRadius: 8,
  },
});

export default BanAndRemoveOption;
