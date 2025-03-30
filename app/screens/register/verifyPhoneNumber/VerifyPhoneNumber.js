import { Button } from "@rneui/themed";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";

const VerifyPhoneNumber = ({ phoneNumber, otpass, otpId, onCancel }) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (phoneNumber) => {
    const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, "");
    if (!cleanedPhoneNumber.startsWith("+")) {
      return "+84" + cleanedPhoneNumber.slice(1);
    }
    return cleanedPhoneNumber;
  };

  const sendOTP = async () => {
    setIsLoading(true);
    // try {
    //   const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    //   console.log("Sending OTP to:", formattedPhoneNumber);

    //   // Gửi OTP bằng Firebase Authentication cho React Native
    //   const confirmation = await auth().signInWithPhoneNumber(
    //     formattedPhoneNumber
    //   );

    //   console.log("OTP sent successfully");

    //   // Điều hướng đến màn hình nhập mã OTP
    //   navigation.navigate("VerifyOTPCode", {
    //     confirmation,
    //     phoneNumber: formattedPhoneNumber,
    //   });
    // } catch (error) {
    //   console.error("Error sending OTP:", error.message);
    //   console.log("Error sending OTP:", error);
    //   console.log("Error code:", error.code);
    //   // Hiển thị thông báo lỗi cho người dùng
    //   Alert.alert("Lỗi", `Không thể gửi OTP: ${error.message}`);
    // } finally {
    //   setIsLoading(false);
    // }

    navigation.navigate("VerifyOTPCode", {
      phoneNumber: phoneNumber,
      otpass: otpass,
      otpId: otpId,
    });
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nhập mã xác thực qua số {phoneNumber}?</Text>
      <Text>Ứng dụng sẽ gửi mã OTP qua SMS</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity style={styles.verifyButton} onPress={sendOTP}>
          <Text style={styles.verifyButtonText}>Gửi mã OTP</Text>
        </TouchableOpacity>
      )}

      <Button type="clear" style={styles.button} onPress={onCancel}>
        Đổi số khác
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "80%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "column",
    gap: 10,
  },
  button: {
    color: "#000",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
  },
  verifyButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VerifyPhoneNumber;
