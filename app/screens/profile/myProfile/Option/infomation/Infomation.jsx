import { AuthContext } from "@/app/auth/AuthContext";
import AvatarUser from "@/app/components/profile/AvatarUser";
import React, { useContext } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "@/app/components/colors/Color";
import AntDesign from "@expo/vector-icons/AntDesign";

const Infomation = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const randomImageId = Math.floor(Math.random() * 1000); // Generate a random image ID

  // Format birthday to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      {/* Section 1: Cover image, avatar, and username */}
      <View style={styles.header}>
        <Image
          source={{ uri: `https://picsum.photos/id/${randomImageId}/800/500` }}
          style={styles.coverImage}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.avatarRow}>
          {userInfo?.urlavatar ? (
            <Image source={{ uri: userInfo.urlavatar }} style={styles.avatar} />
          ) : (
            <AvatarUser
              fullName={userInfo.fullname}
              width={60}
              height={60}
              avtText={20}
              shadow={true}
              bordered={true}
            />
          )}
          <Text style={styles.username}>
            {userInfo.fullname || "Tên người dùng"}
          </Text>
        </View>
      </View>

      {/* Section 2: Personal information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Giới tính:</Text>
          <Text style={styles.infoText}>{userInfo.isMale ? "Nam" : "Nữ"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày sinh:</Text>
          <Text style={styles.infoText}>{formatDate(userInfo.birthday)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <Text style={styles.infoText}>
            {userInfo.phone || "Chưa cập nhật"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            navigation.navigate("Edit");
          }}
        >
          <AntDesign name="edit" size={20} color="black" />
          <Text style={styles.editButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
  },
  coverImage: {
    height: 180,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    padding: 5,
  },
  avatarRow: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(221, 221, 221, 0.8)",
    backgroundColor: "rgba(240, 240, 240, 0.8)",
    overflow: "hidden",
  },
  username: {
    fontSize: 14,
    fontWeight: "400",
    marginLeft: 10,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    flex: 2,
    textAlign: "left",
  },
  editButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: Colors.grayBackgroundButton2,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  editButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Infomation;
