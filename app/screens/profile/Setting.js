import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeadView from "../header/Header";

import { api } from "@/app/api/api";
import { useNavigation } from "expo-router";

const settings = [
  {
    id: "1",
    title: "Tài khoản và bảo mật",
    icon: "shield",
    screen: "AccountAndSecurity",
  },
  { id: "2", title: "Quyền riêng tư", icon: "lock-closed" },
  { id: "3", title: "Dữ liệu trên máy", icon: "time" },
  { id: "4", title: "Sao lưu và khôi phục", icon: "cloud-upload" },
  { id: "5", title: "Thông báo", icon: "notifications" },
  { id: "6", title: "Tin nhắn", icon: "chatbubbles" },
  { id: "7", title: "Cuộc gọi", icon: "call" },
  { id: "8", title: "Nhật ký", icon: "hourglass" },
  { id: "9", title: "Danh bạ", icon: "person-add" },
  { id: "10", title: "Giao diện và ngôn ngữ", icon: "globe" },
  { id: "11", title: "Thông tin về Zalo", icon: "information-circle" },
  { id: "12", title: "Liên hệ hỗ trợ", icon: "help-circle" },
  { id: "13", title: "Chuyển tài khoản", icon: "swap-horizontal" },
];

const Setting = ({ route, navigation }) => {
  const { userInfo } = route.params; // Lấy userInfo từ route.params

  const handleLogout = async () => {
    try {
      // Gọi API để đăng xuất
      await api.logout();
      console.log("Đăng xuất thành công");

      // Chuyển hướng người dùng về màn hình đăng nhập
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }], // Thay "LoginScreen" bằng tên màn hình đăng nhập của bạn
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        item.id === "2" ||
        item.id === "4" ||
        item.id === "10" ||
        item.id === "12"
          ? styles.itemWithThickBorder
          : {},
      ]}
      onPress={() => {
        if (item.screen) {
          navigation.navigate(item.screen, { userInfo }); // Truyền userInfo
        } else if (item.id === "12") {
          navigation.navigate("Support");
        } else if (item.id === "1") {
          navigation.navigate("AccountAndSecurity", { userInfo }); // Truyền userInfo
        }
        console.log(userInfo); // Log the title of the clicked item}
      }}
    >
      <View style={styles.leftContainer}>
        <Ionicons name={item.icon} size={24} color="rgb(61, 131, 237)" />
        <Text style={styles.settingText}>{item.title}</Text>
      </View>
      <Ionicons
        name={
          item.id === "12" ? "chatbubble-ellipses-outline" : "chevron-forward"
        }
        size={16}
        color="gray"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeadView page={"Setting"} />
      <FlatList
        data={settings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
        // Add keyExtractor to give a unique key for each item
      />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#000" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    marginTop: 20,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1, // Default border width
    borderBottomColor: "#f0f2f5",
  },
  itemWithThickBorder: {
    borderBottomWidth: 10, // Đặt borderBottomWidth lớn hơn cho các mục yêu cầu
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 20,
    color: "#000",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 15,
    marginTop: 20,
    marginHorizontal: 40,
    borderRadius: 25,
  },
  logoutText: {
    color: "#000",
    marginLeft: 10,
    fontSize: 16,
  },
});

export default Setting;
