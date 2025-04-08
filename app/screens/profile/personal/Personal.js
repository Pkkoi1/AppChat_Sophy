import AvatarUser from "@/app/components/profile/AvatarUser";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import React, { useContext, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import Color from "@/app/components/colors/Color";
import { AuthContext } from "../../../auth/AuthContext"; // Import useAuth hook

const { height: screenHeight, width: screenWidth } = Dimensions.get("window"); // Lấy chiều cao và chiều rộng màn hình

const Personal = ({ navigation }) => {
  // Lấy userInfo từ AuthContext
  const { userInfo } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading

  if (isLoading) {
    return <Text>Loading...</Text>; // Hiển thị trạng thái loading
  }

  const info = [
    {
      name: "Tên sophy",
      value: userInfo?.fullname || "Người dùng",
      icon: (
        <MaterialCommunityIcons
          name="account-circle-outline"
          size={20}
          color="black"
        />
      ),
    },
    {
      name: "Ngày sinh",
      value: userInfo?.birthday || "Chưa cập nhật",
      icon: (
        <MaterialCommunityIcons
          name="calendar-text-outline"
          size={20}
          color="black"
        />
      ),
    },
    {
      name: "Giới tính",
      value:
        userInfo?.isMale === true
          ? "Nam"
          : userInfo?.isMale === false
          ? "Nữ"
          : "Chưa cập nhật",
      icon: <Octicons name="person" size={20} color="black" />,
    },
  ];

  return (
    <View style={styles.container}>
      <OptionHeader
        title={"Thông tin cá nhân"}
        previousScreen={"AccountAndSecurity"}
        navigation={navigation}
      />
      <View style={styles.content}>
        <View style={styles.avatar}>
          {userInfo?.urlavatar ? (
            <Image
              source={{ uri: userInfo?.urlavatar }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <AvatarUser
              fullName={userInfo?.fullname || "Người dùng"}
              width={100}
              height={100}
              avtText={24}
              shadow={false}
              bordered={false}
            />
          )}
        </View>

        <View style={styles.infoContainer}>
          {info.map((item, index) => (
            <View key={index} style={styles.infoRow}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <View style={styles.textContainer}>
                <Text style={styles.infoName}>{item.name}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            navigation.navigate("Edit");
          }}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color="grey"
          />
          <Text style={styles.editButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  content: {
    justifyContent: "flex-start", // Căn nội dung từ trên xuống
    alignItems: "center", // Căn giữa theo chiều ngang
    paddingHorizontal: screenWidth * 0.05, // Padding ngang 5% chiều rộng màn hình
    paddingVertical: 20, // Padding dọc
    backgroundColor: "#fff",
  },
  avatar: {
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#000",
  },
  infoContainer: {
    width: "100%",
    marginTop: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconContainer: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row", // Hiển thị các thành phần theo hàng ngang
    justifyContent: "space-between", // Khoảng cách giữa các thành phần
    alignItems: "center", // Căn giữa theo chiều dọc
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    marginLeft: 10,
  },
  infoName: {
    fontSize: 16,
    color: Color.gray,
  },
  infoValue: {
    fontSize: 14,
    color: "#000",
    marginTop: 2,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: Color.grayBackgroundButton2,
    paddingVertical: 10,
    paddingHorizontal: screenWidth * 0.3, // Chiều rộng nút bằng 30% chiều rộng màn hình
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  editButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Personal;
