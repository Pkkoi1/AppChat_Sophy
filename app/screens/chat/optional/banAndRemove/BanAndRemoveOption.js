import {
  Ionicons,
  AntDesign,
  SimpleLineIcons,
  Feather,
} from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Colors from "../../../../components/colors/Color";
import { api } from "@/app/api/api";
import { useNavigation } from "@react-navigation/native";

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
];

const BanAndRemoveOption = ({ conversation, receiver }) => {
  const navigation = useNavigation();
  const handleOptionPress = async (optionName) => {
    if (optionName === "Rời nhóm") {
      Alert.alert("Xác nhận", "Bạn có chắc chắn muốn rời nhóm không?", [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              await api.leaveGroup(conversation.conversationId);
              Alert.alert("Thành công", "Bạn đã rời nhóm.");
              navigation.goBack(); // Navigate back after leaving the group
            } catch (error) {
              Alert.alert("Lỗi", "Không thể rời nhóm. Vui lòng thử lại sau.");
              console.error("Lỗi khi rời nhóm:", error);
            }
          },
        },
      ]);
    } else {
      console.log(`Option "${optionName}" selected.`);
    }
  };

  return (
    <View style={styles.container}>
      {options
        .filter((option) => option.includeGroup || !conversation?.isGroup)
        .filter((option) => option.name !== "Rời nhóm" || conversation?.isGroup)
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
});

export default BanAndRemoveOption;
