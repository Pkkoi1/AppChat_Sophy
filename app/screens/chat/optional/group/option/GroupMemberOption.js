import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { BottomSheet } from "@rneui/themed";
import AvatarUser from "@/app/components/profile/AvatarUser";
import AntDesign from "@expo/vector-icons/AntDesign";

const GroupMemberOption = ({ isVisible, onClose, memberInfo, onAction }) => {
  const renderAvatar = () => {
    const fullName = memberInfo?.fullname || "User";
    const url = memberInfo?.urlavatar;

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

  return (
    <BottomSheet isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <AntDesign name="close" size={20} color="#000" />
        </TouchableOpacity>
        <View style={styles.header}>
          {renderAvatar()}
          <Text style={styles.memberName}>
            {memberInfo?.fullname || "Không rõ"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onAction("message")}
        >
          <Text style={styles.optionText}>Nhắn tin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onAction("viewProfile")}
        >
          <Text style={styles.optionText}>Xem trang cá nhân</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onAction("promote")}
        >
          <Text style={styles.optionText}>Bổ nhiệm làm nhóm phó</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onAction("block")}
        >
          <Text style={styles.optionText}>Chặn thành viên</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onAction("remove")}
        >
          <Text style={styles.optionText}>Xóa khỏi nhóm</Text>
        </TouchableOpacity>
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
