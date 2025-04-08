import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AvatarUser from "@/app/components/profile/AvatarUser"; // Đường dẫn đến AvatarUser
import Color from "@/app/components/colors/Color";
import AntDesign from "@expo/vector-icons/AntDesign";

const Account = ({ userInfo, navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tài khoản</Text>

      <TouchableOpacity
        style={styles.accountContainer}
        activeOpacity={0.8}
        onPress={() => {
          // Personal
          navigation.navigate("Personal", {
            userInfo: userInfo,
          });
        }}
      >
        {userInfo?.urlavatar ? (
          <Image
            source={{ uri: userInfo?.urlavatar }}
            style={styles.avatarImage}
          />
        ) : (
          <AvatarUser
            fullName={userInfo?.fullname || "Người dùng"}
            width={70}
            height={70}
            avtText={28}
            shadow={false}
            bordered={false}
          />
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.manageAccountText}>Thông tin cá nhân</Text>

          <Text style={styles.fullName}>
            {userInfo?.fullname || "Người dùng"}
          </Text>
        </View>
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoRow} activeOpacity={0.8}>
        <AntDesign name="phone" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.infoText}>Số điện thoại</Text>
          <Text style={styles.infoValue}>(+84) 792 764 303</Text>
        </View>
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoRow} activeOpacity={0.8}>
        <AntDesign name="mail" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.infoText}>Email</Text>
          <Text style={styles.infoValue}>Chưa liên kết</Text>
        </View>
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoRow} activeOpacity={0.8}>
        <AntDesign name="idcard" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.infoText}>Định danh tài khoản</Text>
          <Text style={styles.infoValue}>Chưa định danh</Text>
        </View>
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.infoRow]} activeOpacity={0.8}>
        <AntDesign name="qrcode" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.infoText}>Mã QR của tôi</Text>
        </View>
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>
      <View style={styles.lastInfoRow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    color: Color.blueText2,
  },
  accountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  infoContainer: {
    marginLeft: 15,
    flex: 1,
  },
  fullName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  manageAccountText: {
    fontSize: 16,
    color: Color.gray,
    marginTop: 5,
  },
  additionalInfoContainer: {
    marginTop: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  lastInfoRow: {
    borderBottomWidth: 10,
    borderBottomColor: "#eee",
    marginHorizontal: -20,
    marginTop: -1,
  },
  icon: {
    width: 24, // Đảm bảo icon có kích thước cố định
  },
  infoText: {
    fontSize: 16,
    color: "#000",
  },
  infoValue: {
    fontSize: 16,
    color: "grey",
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
});

export default Account;
