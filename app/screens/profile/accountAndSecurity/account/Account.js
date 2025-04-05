import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AvatarUser from "@/app/components/profile/AvatarUser"; // Đường dẫn đến AvatarUser
import Color from "@/app/components/colors/Color";
import AntDesign from "@expo/vector-icons/AntDesign";

const Account = ({ userInfo }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tài khoản</Text>

      <TouchableOpacity style={styles.accountContainer}>
        {userInfo?.urlavatar ? (
          <Image
            source={{ uri: userInfo.urlavatar }}
            style={styles.avatarImage}
          />
        ) : (
          <AvatarUser
            fullName={userInfo?.fullname || "Người dùng"}
            width={60}
            height={60}
            avtText={24}
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
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 15,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  infoContainer: {
    marginLeft: 15,
    flex: 1,
  },
  fullName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  manageAccountText: {
    fontSize: 15,
    color: Color.gray,
    marginTop: 5,
  },
});

export default Account;
