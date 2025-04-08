import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Color from "@/app/components/colors/Color"; 

const Security = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Bảo mật</Text>

      <TouchableOpacity
        style={styles.securityRow}
        activeOpacity={0.8}
        onPress={() => {
          // Điều hướng đến màn hình kiểm tra bảo mật
          navigation.navigate("SecurityCheck");
        }}
      >
        <AntDesign name="Safety" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.securityText}>Kiểm tra bảo mật</Text>
          <Text style={styles.securityValue}>2 vấn đề bảo mật cần xử lý</Text>
        </View>
        <AntDesign name="warning" size={24} color="gold" />
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.securityRow}
        activeOpacity={0.8}
        onPress={() => {
          // Điều hướng đến màn hình khóa Zalo
          navigation.navigate("LockZalo");
        }}
      >
        <AntDesign name="lock" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.securityText}>Khóa Zalo</Text>
          <Text style={styles.securityValue}>Đang tắt</Text>
        </View>
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>
      <View style={styles.lastInfoRow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Color.blueText2,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 15,
    width: 24,
  },
  securityText: {
    fontSize: 16,
    color: "#000",
  },
  securityValue: {
    fontSize: 16,
    color: "goldenrod",
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  lastInfoRow: {
    borderBottomWidth: 10,
    borderBottomColor: "#eee",
    marginHorizontal: -20,
    marginTop: -1,
  },
});

export default Security;