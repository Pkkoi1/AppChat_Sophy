import React from "react";
import { Image, SafeAreaView, Text, View, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";

const options = [
  {
    name: "Tìm\n tin nhắn",
    icon: <AntDesign name="search1" size={20} color="black" />,
  },
  {
    name: "Trang\n cá nhân",
    icon: <AntDesign name="user" size={20} color="black" />,
    showIfGroup: false,
  },
  {
    name: "Thêm\n thành viên",
    icon: <AntDesign name="adduser" size={20} color="black" />,
    showIfGroup: true,
  },
  {
    name: "Đổi\n hình nền",
    icon: <Octicons name="paintbrush" size={20} color="black" />,
  },
  {
    name: "Tắt\n thông báo",
    icon: <Ionicons name="notifications-outline" size={20} color="black" />,
  },
];

const ConversationName = ({ receiver, groupName, participants }) => {
  const defaultGroupAvatar = require("../../../../assets/images/default-group-avatar.jpg");

  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.avatar}
        source={groupName ? defaultGroupAvatar : { uri: receiver?.avatar }}
      />
      <Text style={styles.name}>{groupName || receiver?.name}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          if (
            (groupName && option.showIfGroup === false) ||
            (!groupName && option.showIfGroup === true)
          ) {
            return null;
          }
          return (
            <View key={index} style={styles.option}>
              <View style={styles.optionIcon}>{option.icon}</View>
              <Text style={styles.optionText}>{option.name}</Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 0,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
  },
  optionsContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  option: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 15,
  },
  optionText: {
    fontSize: 11,

    textAlign: "center",
  },
  optionIcon: {
    borderRadius: 50,
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
});

export default ConversationName;
