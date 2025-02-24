import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import styles from "@/components/LoginStyle/ForgotPassword.style";
import Icon from "react-native-vector-icons/Ionicons";
import { createNativeStackNavigator } from '@react-navigation/native-stack';


function ResetPasswordScreen({ navigation }) {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {/* Replace button with icon */}
          <Icon name="arrow-back" size={26} color="#fff" />
          

        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lấy lại mật khẩu</Text>
      </View>

      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Nhập số điện thoại để lấy lại mật khẩu
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.nextButton} onPress={handleResetPassword}>
        <Text style={styles.nextButtonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ResetPasswordScreen;
