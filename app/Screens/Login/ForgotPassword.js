import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
// import styles from "./styles/ForgotPassword.style";
function ResetPasswordScreen() {
  const [phone, setPhone] = useState("");

  const handleResetPassword = function () {
    if (!phone) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại!");
      return;
    }
    Alert.alert("Thành công", "Yêu cầu lấy lại mật khẩu đã được gửi!");
  };

  return (
    <View style={styles.container}>
      {/* Hướng dẫn */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Nhập số điện thoại để lấy lại mật khẩu
        </Text>
      </View>

      {/* Trường nhập số điện thoại */}
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Nút gửi */}
      <TouchableOpacity style={styles.nextButton} onPress={handleResetPassword}>
        <Text style={styles.nextButtonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  subtitleContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  nextButton: {
    width: 50,
    height: 50,
    backgroundColor: "#0c8de8",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 20,
  },
});


export default ResetPasswordScreen;
