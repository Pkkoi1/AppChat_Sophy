import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthLoading = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Lấy dữ liệu userInfo từ AsyncStorage
        const userInfoString = await AsyncStorage.getItem("userInfo");
        console.log("userInfoString from AsyncStorage:", userInfoString);

        // Kiểm tra xem userInfoString có tồn tại và không rỗng
        if (userInfoString) {
          let userInfo;
          try {
            userInfo = JSON.parse(userInfoString); // Parse chuỗi JSON thành object
            console.log("Parsed userInfo:", userInfo.fullname);
          } catch (parseError) {
            console.error("Lỗi khi parse userInfo:", parseError);
            navigation.replace("Main");
            return;
          }

          // Kiểm tra xem userInfo có các thuộc tính cần thiết
          if (userInfo && userInfo.userId && userInfo.fullname) {
            console.log("userInfo hợp lệ, điều hướng đến Home");
            navigation.replace("Home", {
              userId: userInfo.userId,
              userName: userInfo.fullname,
              phone: userInfo.phone || "",
            });
          } else {
            console.log("userInfo không hợp lệ, điều hướng về Main");
            navigation.replace("Main");
          }
        } else {
          console.log("Không tìm thấy userInfo, điều hướng về Main");
          navigation.replace("Main");
        }
      } catch (e) {
        console.error("Lỗi khi kiểm tra login:", e);
        navigation.replace("Main");
      }
    };
    checkLogin();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default AuthLoading;
