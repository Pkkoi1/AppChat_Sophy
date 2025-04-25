import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { BottomSheet } from "@rneui/themed";
import AvatarUser from "@/app/components/profile/AvatarUser";
import AntDesign from "@expo/vector-icons/AntDesign";
import { AuthContext } from "@/app/auth/AuthContext";

const GroupMemberOption = ({
  isVisible,
  onClose,
  memberInfo,
  onAction,
  isCoOwner,
  availableActions,
}) => {
  const renderAvatar = () => {
    const fullName = memberInfo?.fullName || "User";
    const url = memberInfo?.urlAvatar;

    const { changeRole } = useContext(AuthContext);

    return url ? (
      <Image source={{ uri: url }} style={styles.avatar} />
    ) : (
      <AvatarUser
        fullName={fullName}
        width={60}
        height={60}
        avtText={20}
        shadow={false}
        bordered={false}
      />
    );
  };

  const renderOption = (action, label) => (
    <TouchableOpacity
      key={action}
      style={styles.option}
      onPress={() => onAction(action)}
    >
      <Text style={styles.optionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <AntDesign name="close" size={20} color="#000" />
        </TouchableOpacity>
        <View style={styles.header}>
          {renderAvatar()}
          <Text style={styles.memberName}>
            {memberInfo?.fullName || "Không rõ"}
          </Text>
        </View>
        {availableActions.includes("message") &&
          renderOption("message", "Nhắn tin")}
        {availableActions.includes("viewProfile") &&
          renderOption("viewProfile", "Xem trang cá nhân")}
        {availableActions.includes("promote") &&
          renderOption("promote", "Bổ nhiệm làm nhóm phó")}
        {availableActions.includes("removeCoOwner") &&
          renderOption("removeCoOwner", "Xóa vai trò nhóm phó")}
        {availableActions.includes("block") &&
          renderOption("block", "Chặn thành viên")}
        {availableActions.includes("remove") &&
          renderOption("remove", "Xóa khỏi nhóm")}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
});

export default GroupMemberOption;
