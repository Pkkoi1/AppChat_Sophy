import React, { useContext, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "@/app/auth/AuthContext";

const AuthLoading = ({ navigation }) => {
  const { userInfo, isLoading } = useContext(AuthContext);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Wait until AuthContext has finished loading
        if (isLoading) {
          console.log("AuthContext is still loading...");
          return;
        }

        // Check if userInfo is valid
        if (userInfo && userInfo.userId && userInfo.fullname) {
          console.log(
            "Valid userInfo found in AuthContext:",
            userInfo.fullname
          );
          navigation.replace("Home", {
            userId: userInfo.userId,
            userName: userInfo.fullname,
            phone: userInfo.phone || "",
          });
        } else {
          console.log(
            "No valid userInfo in AuthContext, navigating to Main:",
            userInfo
          );
          navigation.replace("Main");
        }
      } catch (error) {
        console.error("Error during login check:", error);
        navigation.replace("Main");
      }
    };

    checkLogin();
  }, [navigation, userInfo, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default AuthLoading;
