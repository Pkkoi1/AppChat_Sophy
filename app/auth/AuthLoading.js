import React, { useEffect, useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "./AuthContext"; // Import AuthContext

const AuthLoading = ({ navigation }) => {
  const { refreshAccessToken, userInfo } = useContext(AuthContext); // Use AuthContext

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Làm mới token và lấy thông tin người dùng
        await refreshAccessToken();

        if (userInfo) {
          navigation.replace("Home", {
            userId: userInfo.userId,
            userName: userInfo.fullname,
            phone: userInfo.phone || "",
          });
        } else {
          navigation.replace("Main");
        }
      } catch (e) {
        console.log("Lỗi khi làm mới token hoặc load dữ liệu:", e);
        navigation.replace("Main");
      }
    };

    checkLogin();
  }, [userInfo]); // Theo dõi userInfo để điều hướng chính xác

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default AuthLoading;
