import React from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const MyProfile = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: "https://example.com/neon-background.jpg" }} // Thay bằng URL hình nền neon từ hình ảnh
      style={styles.background}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logo}>
          <Text style={styles.logoText}>TN</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <AntDesign name="ellipsis1" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>Thành Nghiêm</Text>
        <TouchableOpacity style={styles.editButton}>
          <AntDesign name="edit" size={16} color="#007AFF" />
          <Text style={styles.editText}>Cập nhật giới thiệu bản thân</Text>
        </TouchableOpacity>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button}>
            <AntDesign name="user" size={20} color="#007AFF" />
            <Text style={styles.buttonText}>Cài zStyle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <AntDesign name="picture" size={20} color="#007AFF" />
            <Text style={styles.buttonText}>Ảnh của tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <AntDesign name="folder" size={20} color="#007AFF" />
            <Text style={styles.buttonText}>Kho khoảnh l</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.intro}>
          <Text style={styles.introText}>
            Hôm nay Thành Nghiêm có gì vui?{"\n"}
            Đây là Nhật ký của bạn - Hãy làm ngày Nhật ký vui nhộn hơn với những câu nói và ký niệm đáng nhớ!
          </Text>
          <TouchableOpacity style={styles.postButton}>
            <Text style={styles.postButtonText}>Đăng lên Nhật ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    paddingTop: 40, // Điều chỉnh để khớp với khoảng cách trên cùng trong hình
  },
  backButton: {
    padding: 5,
  },
  menuButton: {
    padding: 5,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#a3d9a5", // Màu xanh lá nhạt giống hình
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Màu nền nhạt giống hình
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 100, // Điều chỉnh để khớp với vị trí trong hình
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 5,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    alignSelf: "flex-end",
  },
  editText: {
    color: "#007AFF",
    marginLeft: 5,
    fontSize: 14,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  button: {
    alignItems: "center",
  },
  buttonText: {
    color: "#007AFF",
    marginTop: 5,
    fontSize: 14,
  },
  intro: {
    alignItems: "center",
    marginTop: 20,
  },
  introText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MyProfile;