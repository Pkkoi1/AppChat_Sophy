import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";

const GroupSetting = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button}>
        <View style={styles.buttonIcon}>
          <EvilIcons name="gear" size={20} color="#888c90" />
        </View>

        <View style={styles.textBorder}>
          <Text style={styles.groupText}>Cài đặt nhóm</Text>
        </View>
      </TouchableOpacity>
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
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 24,
    paddingTop: 18,
  },
  groupText: {
    color: "#000",
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

export default GroupSetting;
