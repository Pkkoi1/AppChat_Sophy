import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import styles from "./styles/ForgotPassword.style";
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



export default ResetPasswordScreen;
