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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Colors from "../../../../components/colors/Color";
import { api } from "@/app/api/api";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "@/app/auth/AuthContext";
import { Overlay } from "@rneui/themed"; // Import Overlay from RNEUI
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import { RadioButton } from "react-native-paper"; // Import RadioButton from react-native-paper
import AvatarUser from "@/app/components/profile/AvatarUser"; // Import AvatarUser
import { SocketContext } from "@/app/socket/SocketContext";

const options = [
  {
    name: "Báo xấu",
    icon: <AntDesign name="warning" size={20} color={Colors.gray} />,
    includeGroup: false, // Always show this option
    isGroup: false,
    color: "black",
  },
  {
    name: "Chuyển quyền trưởng nhóm",
    icon: (
      <MaterialCommunityIcons
        name="account-switch-outline"
        size={20}
        color={Colors.gray}
      />
    ),
    includeGroup: true,
    isGroup: true,
    color: Colors.primary,
    ownerOnly: true, // Visible only to the group owner
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
    includeGroup: false, // Always show this option
    isGroup: true,
    color: "black",
  },
  {
    name: "Xóa lịch sử trò chuyện",
    icon: <SimpleLineIcons name="trash" size={20} color="red" />,
    includeGroup: false, // Always show this option
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
  const {
    userInfo,
    handlerRefresh,
    removeConversation,
    groupMember,
    changeRole,
  } = useContext(AuthContext); // Add removeConversation
  const navigation = useNavigation();
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [overlayAction, setOverlayAction] = useState(""); // Track the current action for the overlay
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false); // State to track if the user is the group owner

  useEffect(() => {
    setIsOwner(conversation.rules?.ownerId === userInfo.userId);
  }, [conversation.rules?.ownerId, userInfo.userId]); // Recalculate when conversation rules or user info changes

  const { socket } = useContext(SocketContext);

  const isGroup = conversation.isGroup; // Check if the conversation is a group

  const fetchGroupMembers = async () => {
    setLoadingMembers(true);
    try {
      // Use groupMember to fetch the list of members
      const filteredMembers = groupMember.filter(
        (member) => member.role !== "owner" // Exclude the current owner
      );

      setGroupMembers(filteredMembers);
      setSelectedOwner(filteredMembers[0]?.id || null); // Default to the first member
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

  const confirmLeaveGroup = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn rời nhóm không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            if (isOwner && selectedOwner) {
              await api.addOwner(conversation.conversationId, selectedOwner);
              changeRole(conversation.conversationId, selectedOwner, "owner");
              changeRole(
                conversation.conversationId,
                userInfo.userId,
                "member"
              );
              Alert.alert("Thành công", "Quyền nhóm trưởng đã được chuyển.");
            }
            await api.leaveGroup(conversation.conversationId);
            Alert.alert("Thành công", "Bạn đã rời nhóm.");
            navigation.navigate("Home");
            handlerRefresh();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể rời nhóm. Vui lòng thử lại sau.");
            console.error("Lỗi khi rời nhóm:", error);
          }
        },
      },
    ]);
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
              await api.addOwner(conversation.conversationId, selectedOwner);
              changeRole(conversation.conversationId, selectedOwner, "owner");
              Alert.alert("Thành công", "Quyền nhóm trưởng đã được chuyển.");
              changeRole(conversation.conversationId, selectedOwner, "owner");
              changeRole(
                conversation.conversationId,
                userInfo.userId,
                "member"
              );
              setOverlayVisible(false);
              handlerRefresh();
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

  const handleOptionPress = async (optionName) => {
    if (optionName === "Rời nhóm") {
      if (isOwner) {
        await fetchGroupMembers(); // Fetch group members before showing the overlay
        setOverlayAction("Rời nhóm");
        setOverlayVisible(true);
      } else {
        confirmLeaveGroup(); // No ownership transfer needed
      }
    } else if (optionName === "Chuyển quyền trưởng nhóm") {
      await fetchGroupMembers(); // Fetch group members before showing the overlay
      setOverlayAction("Chuyển quyền trưởng nhóm");
      setOverlayVisible(true);
    } else if (optionName === "Xóa lịch sử trò chuyện") {
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện không?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đồng ý",
            onPress: async () => {
              try {
                await removeConversation(conversation.conversationId); // Call removeConversation
                Alert.alert("Thành công", "Lịch sử trò chuyện đã được xóa.");
                navigation.goBack(); // Navigate back after clearing history
              } catch (error) {
                Alert.alert(
                  "Lỗi",
                  "Không thể xóa lịch sử trò chuyện. Vui lòng thử lại."
                );
                console.error("Lỗi khi xóa lịch sử trò chuyện:", error);
              }
            },
          },
        ]
      );
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
                  navigation.navigate("Home");
                  handlerRefresh();
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

  const renderMember = (member) => {
    const { id, fullName, role, urlAvatar } = member;

    return (
      <TouchableOpacity
        key={id}
        style={styles.memberItem}
        onPress={() => setSelectedOwner(id)}
      >
        <View style={styles.memberInfo}>
          <View style={styles.avatarContainer}>
            {urlAvatar ? (
              <Image source={{ uri: urlAvatar }} style={styles.avatar} />
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
          </View>

          <View>
            <Text style={styles.memberName}>{fullName}</Text>
            <Text style={styles.memberRole}>
              {role === "co-owner"
                ? "Phó nhóm"
                : role === "member"
                ? "Thành viên"
                : role}
            </Text>
          </View>
        </View>
        <RadioButton
          value={id}
          status={selectedOwner === id ? "checked" : "unchecked"}
          onPress={() => setSelectedOwner(id)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {options
        .filter((option) => isGroup || !option.includeGroup || !option.isGroup) // Always show non-group-specific options
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

      {isGroup && (
        <Overlay
          isVisible={isOverlayVisible}
          onBackdropPress={() => setOverlayVisible(false)}
          overlayStyle={styles.overlayContainer}
        >
          <Text style={styles.overlayTitle}>
            {overlayAction === "Rời nhóm"
              ? "Chọn thành viên để làm nhóm trưởng trước khi rời nhóm"
              : "Chọn thành viên để làm nhóm trưởng"}
          </Text>
          {loadingMembers ? (
            <Text style={styles.loadingText}>
              Đang tải danh sách thành viên...
            </Text>
          ) : (
            groupMembers.map(renderMember)
          )}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={
              overlayAction === "Rời nhóm" ? confirmLeaveGroup : handleSetOwner
            }
          >
            <Text style={styles.confirmButtonText}>
              {overlayAction === "Rời nhóm"
                ? "Chọn và rời nhóm"
                : "Chọn và chuyển quyền"}
            </Text>
          </TouchableOpacity>
        </Overlay>
      )}
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
    marginRight: 10,
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
