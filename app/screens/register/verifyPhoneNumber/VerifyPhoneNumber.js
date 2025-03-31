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
  const [code, setCode] = useState(otpass);

  const formatPhoneNumber = (phoneNumber) => {
    const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, "");
    if (!cleanedPhoneNumber.startsWith("+")) {
      return "+84" + cleanedPhoneNumber.slice(1);
    }
    return cleanedPhoneNumber;
  };

  const sendOTP = async () => {
    // setIsLoading(true);

    // try {
    //   // Định dạng số điện thoại
    //   const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    //   // Gửi OTP qua Firebase Authentication
    //   const confirmation = await auth().signInWithPhoneNumber(
    //     formattedPhoneNumber
    //   );

    //   // Lấy verificationId từ confirmation
    //   const verificationId = confirmation.verificationId;

    //   if (!verificationId) {
    //     throw new Error("Không thể lấy mã xác thực. Vui lòng thử lại.");
    //   }

    //   // Hiển thị thông báo thành công và điều hướng đến màn hình nhập OTP
    //   Alert.alert("Thành công", "Mã OTP đã được gửi qua SMS.");
    //   navigation.navigate("VerifyOTPCode", {
    //     phoneNumber: phoneNumber,
    //     otpId: verificationId, // Chỉ truyền verificationId
    //   });
    // } catch (error) {
    //   console.error("Error sending OTP:", error.message);

    //   // Xử lý lỗi nếu không gửi được OTP
    //   Alert.alert(
    //     "Lỗi",
    //     error.message || "Không thể gửi mã OTP. Vui lòng thử lại."
    //   );
    // } finally {
    //   setIsLoading(false);
    // }
    navigation.navigate("VerifyOTPCode", {
      phoneNumber: phoneNumber,
      otpass: otpass,
    });
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
