import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthLoading = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userInfo = await AsyncStorage.getItem("userInfo");

        if (token && userInfo) {
          const parsedUser = JSON.parse(userInfo);
          navigation.replace("Home", {
            userId: parsedUser.userId,
            userName: parsedUser.fullname,
            phone: parsedUser.phone || "",
          });
        } else {
          navigation.replace("Main");
        }
      } catch (e) {
        console.log("Lỗi khi load dữ liệu từ AsyncStorage:", e);
        navigation.replace("Main");
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default AuthLoading;
