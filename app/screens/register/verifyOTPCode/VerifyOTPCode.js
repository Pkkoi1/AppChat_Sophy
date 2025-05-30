import React, { useState, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import auth from "@react-native-firebase/auth";

const VerifyOTPCode = ({ route, navigation }) => {
  const { phoneNumber, otpass, otpId } = route.params; // Nhận verificationId từ route.params
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "",
      headerStyle: {
        backgroundColor: "#fff",
        shadowColor: "#fff",
        elevation: 0,
      },
    });
  }, [navigation]);

  const handleInputChange = (value, index) => {
    const newOtp = [...otp];

    if (value === "") {
      // Clear the current field
      newOtp[index] = "";
      setOtp(newOtp);
    } else if (/^\d$/.test(value)) {
      // Accept only numeric input
      newOtp[index] = value;
      setOtp(newOtp);

      // Find the next empty field
      const nextEmptyIndex = newOtp.findIndex((digit, i) => digit === "" && i > index);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus(); // Move to the next empty field
      } else if (index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus(); // Move to the next field if no empty field is found
      }
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = ""; // Clear the previous field
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus(); // Move to the previous field
      }
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join(""); // Ghép các số OTP thành chuỗi
    if (enteredOtp.length === 6) {
      try {
        // if (enteredOtp == otpass) {
        //   Alert.alert("Thành công", "Xác thực số điện thoại thành công!");
        //   navigation.navigate("EnterName", {
        //     phoneNumber,
        //   });
        // }
        //---------------
        const credential = auth.PhoneAuthProvider.credential(otpId, enteredOtp);
        await auth().signInWithCredential(credential);

        Alert.alert("Thành công", "Xác thực số điện thoại thành công!");
        navigation.navigate("EnterName", { phoneNumber });
      } catch (error) {
        console.error("Error verifying OTP:", error.message);
        Alert.alert("Lỗi", "Mã OTP không hợp lệ. Vui lòng thử lại.");
      }
    } else {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số OTP.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Xác minh số điện thoại</Text>
      <Text style={styles.subHeader}>Nhập mã OTP gửi đến {phoneNumber}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleInputChange(value, index)}
            keyboardType="numeric"
            maxLength={1}
            onKeyPress={(event) => handleKeyPress(event, index)}
            ref={(el) => (inputRefs.current[index] = el)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
        style={[styles.resendButton, { marginTop: 10 }]}
        onPress={resendOTP}
      >
        <Text style={styles.resendButtonText}>Gửi lại mã OTP</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
    color: "#000",
    marginRight: 5,
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
  resendButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  resendButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default VerifyOTPCode;
