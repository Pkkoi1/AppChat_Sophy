import { Button } from "@rneui/themed";
import React, { useEffect, useLayoutEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../../../firebaseConfig"; // Import auth từ firebaseConfig.js

const VerifyPhoneNumber = ({ phoneNumber, onCancel }) => {
  const navigation = useNavigation();

 

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber.startsWith("+")) {
      return "+84" + phoneNumber.slice(1); // Thêm mã quốc gia Việt Nam (+84)
    }
    return phoneNumber;
  };

  const sendOTP = async () => {
    // try {
    //   const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    //   const confirmationResult = await signInWithPhoneNumber(
    //     auth,
    //     formattedPhoneNumber
    //   );
    //   console.log("OTP sent successfully");
    //   navigation.navigate("VerifyOTPCode", {
    //     confirmationResult,
    //     phoneNumber: formattedPhoneNumber,
    //   });
    // } catch (error) {
    //   console.error("Error sending OTP:", error.message);
    //   alert("Không thể gửi OTP. Vui lòng thử lại.");
    // }

    navigation.navigate("VerifyOTPCode", {
      phoneNumber: phoneNumber,
    });
  };

  useEffect(() => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Số điện thoại không hợp lệ");
      return;
    }
  }, [phoneNumber]);

  return (
    <View style={VerifyPhoneNumberStyle.container}>
      <Text style={VerifyPhoneNumberStyle.header}>
        Nhập mã xác thực qua số {phoneNumber}?
      </Text>
      <Text>Sophy sẽ gửi mã xác thực cho bạn qua số điện thoại này</Text>

      {/* Nút Tiếp tục */}
      <Button type="clear" onPress={sendOTP}>
        Tiếp tục
      </Button>

      {/* Nút Đổi số khác */}
      <Button
        type="clear"
        style={VerifyPhoneNumberStyle.button}
        onPress={onCancel}
      >
        Đổi số khác
      </Button>
    </View>
  );
};

const VerifyPhoneNumberStyle = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "70%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 50,
    flexDirection: "column",
    gap: 10,
  
  },
  button: {
    backgroundColor: "none",
    color: "#000",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default VerifyPhoneNumber;
