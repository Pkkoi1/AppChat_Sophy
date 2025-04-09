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
  const [isVisible, setIsVisible] = useState(true); // Trạng thái hiển thị giao diện
  const [code, setCode] = useState(otpass);

  const formatPhoneNumber = (phoneNumber) => {
    const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, "");
    if (!cleanedPhoneNumber.startsWith("+")) {
      return "+84" + cleanedPhoneNumber.slice(1);
    }
    return cleanedPhoneNumber;
  };

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

      // Gửi OTP qua Firebase
      const confirmation = await auth().signInWithPhoneNumber(
        formattedPhoneNumber
      );

      Alert.alert("Thành công", "Mã OTP đã được gửi qua SMS.");

      // Tắt giao diện sau khi gửi OTP thành công
      setIsVisible(false);

      navigation.navigate("VerifyOTPCode", {
        phoneNumber,
        otpId: confirmation.verificationId, // <-- gửi đúng cái này thôi
      });
    } catch (error) {
      console.error("Error sending OTP:", error.message);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể gửi mã OTP. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
    // navigation.navigate("VerifyOTPCode", {
    //   phoneNumber: phoneNumber,
    //   otpass: otpass,
    // });
  };

  if (!isVisible) {
    return null; // Không hiển thị giao diện nếu `isVisible` là false
  }

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
