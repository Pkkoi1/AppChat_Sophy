import React from "react";
import {
  Image,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";

const options = [
  {
    name: "Tìm\n tin nhắn",
    icon: <AntDesign name="search1" size={20} color="black" />,
    action: "searchMessages",
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

const ConversationName = ({
  receiver,
  groupName,
  participants,
  conversation_id,
  user_id,
}) => {
  const navigation = useNavigation();
  const defaultGroupAvatar = require("../../../../assets/images/default-group-avatar.jpg");

  const handlePress = (option) => {
    if (option.action === "searchMessages") {
      navigation.navigate("Chat", {
        conversation_id,
        user_id,
        startSearch: true,
      });
    }
  };

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
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => handlePress(option)}
            >
              <View style={styles.optionIcon}>{option.icon}</View>
              <Text style={styles.optionText}>{option.name}</Text>
            </TouchableOpacity>
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
