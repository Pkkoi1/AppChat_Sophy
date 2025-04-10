import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../../../components/colors/Color";
import { Ionicons } from "@expo/vector-icons";

const friendGroupOptions = [
  {
    name: "Tạo nhóm với ",
    icon: <Ionicons name="people-outline" size={20} color={Colors.gray} />,
  },
  {
    name: "Thêm vào nhóm",
    icon: <Ionicons name="person-add-outline" size={20} color={Colors.gray} />,
  },
  {
    name: "Xem nhóm chung",
    icon: <Ionicons name="people-outline" size={20} color={Colors.gray} />,
  },
];

const groupsOption = [
  {
    name: "Xem thành viên",
    icon: <Ionicons name="people-outline" size={20} color={Colors.gray} />,
  },
  {
    name: "Link nhóm",
    icon: <Ionicons name="link-outline" size={20} color={Colors.gray} />,
  },
];

const GroupOption = ({ isGroup, receiver, participants }) => {
  return (
    <View style={styles.container}>
      {isGroup
        ? groupsOption.map((option, index) => (
            <TouchableOpacity style={styles.groupButton} key={index}>
              <View style={styles.buttonIcon}>{option.icon}</View>
              <View style={styles.textBorder}>
                <Text style={styles.buttonText}>{option.name}</Text>
              </View>
            </TouchableOpacity>
          ))
        : friendGroupOptions.map((option, index) => (
            <TouchableOpacity style={styles.groupButton} key={index}>
              <View style={styles.buttonIcon}>{option.icon}</View>
              <View style={styles.textBorder}>
                <Text style={styles.buttonText}>
                  {option.name === "Thêm vào nhóm"
                    ? `Thêm ${receiver?.name} vào nhóm`
                    : option.name === "Tạo nhóm với "
                    ? `${option.name}${receiver?.name}`
                    : option.name}
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
  groupButton: {
    backgroundColor: "#fff",
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 24,
    paddingTop: 16,
  },
  buttonIcon: {
    marginRight: 20,
    paddingBottom: 10,
  },
  textBorder: {
    borderBottomWidth: 0.4,
    borderBottomColor: "#ddd",
    paddingBottom: 16,
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 15,
  },
});

export default GroupOption;
