import {
  Ionicons,
  SimpleLineIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import ToggleSwitch from "../../../../components/toggle/ToggleSwitch";
import Colors from "../../../../components/colors/Color";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";

const options = [
  {
    name: "Ghim trò chuyện",
    icon: <SimpleLineIcons name="pin" size={20} color={Colors.gray} />,
    toggle: true,
    includeGroup: true,
  },
  {
    name: "Ẩn trò chuyện",
    icon: <Ionicons name="eye-off-outline" size={20} color={Colors.gray} />,
    toggle: true,
    includeGroup: true,
  },
  {
    name: "Báo cuộc gọi đến",
    icon: <SimpleLineIcons name="call-in" size={20} color={Colors.gray} />,
    toggle: true,
    includeGroup: false,
  },
  {
    name: "Tin nhắn tự xóa",
    icon: (
      <MaterialCommunityIcons
        name="clock-edit-outline"
        size={20}
        color={Colors.gray}
      />
    ),
    toggle: false,
    includeGroup: false,
  },
  {
    name: "Cài đặt cá nhân",
    icon: (
      <MaterialCommunityIcons
        name="account-cog-outline"
        size={20}
        color={Colors.gray}
      />
    ),
    toggle: false,
    includeGroup: true,
  },
];

const ConversationOption = ({ conversation, receiver }) => {
  const [toggleStates, setToggleStates] = useState({
    0: conversation?.isPinned || false,
  });

  const { userInfo, updateUserInfo } = useContext(AuthContext);

  const toggleSwitch = async (index) => {
    if (index === 0) {
      // Ghim/bỏ ghim trò chuyện
      try {
        const isPinned = toggleStates[index];
        const pinnedList = userInfo?.pinnedConversations || [];

        if (!isPinned && pinnedList.length >= 5) {
          Alert.alert(
            "Không thể ghim thêm",
            "Đã đạt giới hạn 5 cuộc trò chuyện được ghim."
          );
          return;
        }

        if (!isPinned) {
          // Ghim
          await api.pinConversation(conversation.conversationId);
          const newPinned = [
            ...pinnedList,
            {
              conversationId: conversation.conversationId,
              pinnedAt: new Date().toISOString(),
            },
          ];
          await updateUserInfo({ pinnedConversations: newPinned });
          Alert.alert("Thành công", "Cuộc trò chuyện đã được ghim.");
        } else {
          // Bỏ ghim
          await api.unPinConversation(conversation.conversationId);
          const newPinned = pinnedList.filter(
            (p) => p.conversationId !== conversation.conversationId
          );
          await updateUserInfo({ pinnedConversations: newPinned });
          Alert.alert("Thành công", "Đã bỏ ghim cuộc trò chuyện.");
        }

        setToggleStates((prev) => ({
          ...prev,
          [index]: !prev[index],
        }));
      } catch (error) {
        Alert.alert(
          "Lỗi",
          "Không thể thay đổi trạng thái ghim cuộc trò chuyện. Vui lòng thử lại sau."
        );
        console.error(
          "Lỗi khi thay đổi trạng thái ghim cuộc trò chuyện:",
          error
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      {options
        .filter((option) => option.includeGroup || !conversation?.isGroup)
        .map((option, index) => (
          <TouchableOpacity
            style={styles.optionButton}
            key={index}
            onPress={() => option.toggle && toggleSwitch(index)}
          >
            <View style={styles.iconContainer}>{option.icon}</View>
            <View style={styles.textContainer}>
              <Text style={styles.optionText}>{option.name}</Text>
              {option.toggle && (
                <ToggleSwitch
                  isOn={toggleStates[index]}
                  onToggle={() => toggleSwitch(index)}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 15,
  },
  textContainer: {
    borderBottomWidth: 0.43,
    borderBottomColor: "#ddd",
    paddingBottom: 16,
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    color: "#000",
    fontSize: 15,
  },
});

export default ConversationOption;
