import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import ToggleSwitch from "../../../../components/toggle/ToggleSwitch";

const FriendDescription = [
  {
    name: "Đổi tên gợi nhớ",
    icon: <Feather name="edit-3" size={20} color="#888c90" />,
    toggle: false,
  },
  {
    name: "Đánh dấu bạn thân",
    toggle: true,
    icon: <AntDesign name="staro" size={20} color="#888c90" />,
  },
  {
    name: "Nhật ký chung",
    toggle: false,
    icon: <Fontisto name="clock" size={20} color="#888c90" />,
  },
];

const DescriptionOption = ({ isGroup }) => {
  const [toggleStates, setToggleStates] = useState({ 1: false });

  const toggleSwitch = (index) => {
    setToggleStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <View style={styles.container}>
      {isGroup ? (
        <TouchableOpacity style={styles.button}>
          <View style={styles.buttonIcon}>
            <Feather name="info" size={20} color="#888c90" />
          </View>

          <View style={styles.textBorder}>
            <Text style={styles.groupText}>Thêm mô tả nhóm</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <>
          {FriendDescription.map((option, index) => (
            <TouchableOpacity
              style={styles.button}
              key={index}
              onPress={() => toggleSwitch(index)}
            >
              <View style={styles.buttonIcon}>{option.icon}</View>
              <View style={styles.textBorder}>
                <Text style={styles.buttonText}>{option.name}</Text>
                {option.toggle && (
                  <ToggleSwitch
                    isOn={toggleStates[index]}
                    onToggle={() => toggleSwitch(index)}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </>
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
  button: {
    backgroundColor: "#fff",
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 24,
    paddingTop: 18,
  },
  buttonText: {
    color: "#000",
    fontSize: 15,
  },
  groupText: {
    color: "#888c90",
    fontSize: 15,
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
  buttonIcon: {
    marginRight: 20,
    paddingBottom: 15,
  },
});

export default DescriptionOption;
