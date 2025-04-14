import {
  Ionicons,
  AntDesign,
  SimpleLineIcons,
  Feather,
} from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../../../../components/colors/Color";

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
  return (
    <View style={styles.container}>
      {options
        .filter((option) => option.includeGroup || !conversation?.isGroup)
        .filter((option) => option.name !== "Rời nhóm" || conversation?.isGroup)
        .map((option, index) => (
          <TouchableOpacity style={styles.optionButton} key={index}>
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
