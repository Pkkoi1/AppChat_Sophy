import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Thêm import này

const data = [
  { title: "Khôi Nghiêm", description: "Xem trang cá nhân của bạn", icon: "user", group: 0 },
  { title: "zCloud", description: "Không gian lưu trữ dữ liệu trên đám mây", icon: "cloud", group: 1 },
  { title: "zStyle - Nổi bật trên Zalo", description: "Hình nền và nhạc cho cuộc gọi Zalo", icon: "playcircleo", group: 2 },
  { title: "Cloud của tôi", description: "Lưu trữ các tin nhắn quan trọng", icon: "cloud", group: 3 },
  { title: "Dữ liệu trên máy", description: "Quản lý dữ liệu Zalo của bạn", icon: "save", group: 4 },
  { title: "Ví QR", description: "Lưu trữ và xuất trình các mã QR quan trọng", icon: "qrcode", group: 5 },
  { title: "Tài khoản và bảo mật", description: "Quản lý tài khoản và bảo mật", icon: "lock", group: 6 },
  { title: "Quyền riêng tư", description: "Cài đặt quyền riêng tư của bạn", icon: "security", group: 7 },
];

const UserProfileScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useState(new Animated.Value(0))[0]; // Đảm bảo scrollY là Animated.Value
  const navigation = useNavigation(); // Khởi tạo navigation

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleProfilePress = () => {
    navigation.navigate("MyProfile"); // Thực hiện điều hướng tới trang ProfileDetails
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      bounces={true} // Bật hiệu ứng giãn tự nhiên
      overScrollMode="always" // Cho phép kéo giãn trên Android
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false } // Sử dụng native driver để tối ưu hiệu suất
      )}
      scrollEventThrottle={16} // Tối ưu hóa hiệu ứng khi cuộn
    >
      <Animated.View>
        {data.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={[styles.item, styles[`group${item.group}`]]}
            onPress={item.title === "Khôi Nghiêm" ? handleProfilePress : null} // Điều hướng khi nhấn vào trang cá nhân
          >
            <View style={styles.itemContent}>
              <View style={styles.iconWrapper}>
                {item.title === "Khôi Nghiêm" ? (
                  <View style={styles.iconCircle}>
                    <AntDesign name="user" size={24} color="blue" />
                  </View>
                ) : item.icon === "security" ? (
                  <MaterialIcons name="security" size={24} color="blue" />
                ) : (
                  <AntDesign name={item.icon} size={24} color="blue" />
                )}
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            </View>
            <AntDesign name="right" size={16} color="#000" />
          </TouchableOpacity>
        ))}
        <View style={styles.paddingBottom} />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    marginRight: 15,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 55,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: -10,
  },
  textWrapper: {
    flex: 1,
    paddingLeft: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemDescription: {
    fontSize: 12,
    color: "#777",
  },
  group0: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f2f5",
  },
  group2: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f2f5",
  },
  group5: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f2f5",
  },
  group7: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f2f5",
  },
  paddingBottom: {
    height: 50,
  },
});

export default UserProfileScreen;
