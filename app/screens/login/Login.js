import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import styles from "./Login.style";
import Icon from "react-native-vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";

import { Button } from "@rneui/themed";
import { api } from "@/app/api/api";

// Đọc dữ liệu từ file user.json
const users = require("../../../assets/objects/user.json"); // Điều chỉnh đường dẫn theo vị trí file user.json

function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    setIsButtonEnabled(phone.length > 0 && password.length > 0);
  }, [phone, password]);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      // Gọi API đăng nhập
      const response = await api.login({ phone, password });

      if (response && response.data && response.data.user) {
        const { user } = response.data; // Lấy thông tin người dùng từ response.data
        Alert.alert("Đăng nhập thành công!", `Chào ${phone}!`);
        navigation.navigate("Home", {
          userId: user.userId,
          userName: user.fullname,
          phone: phone,
          id: user.id,
        });
      } else {
        Alert.alert("Đăng nhập thất bại!", "Sai số điện thoại hoặc mật khẩu!");
      }
    } catch (error) {
      if (error.message.includes("Network Error")) {
        Alert.alert(
          "Lỗi mạng",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!"
        );
      } else {
        Alert.alert("Đăng nhập thất bại!", "Có lỗi xảy ra, vui lòng thử lại!");
      }
      console.error("Lỗi đăng nhập:", error);
      console.log("Lỗi đăng nhập:", error.message);
      console.log("Chi tiết lỗi:", error.response?.data || error.message);
      // console.log(
      //   "Chi tiết lỗi khi đăng nhập:",
      //   error.response?.data || error.message
      // ); lại
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }} backgroundColor="#007AFF">
      <StatusBar barStyle="light-content" backgroundColor="#1b96fd" />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Main")}>
            <Icon name="arrow-back" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng nhập</Text>
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mật khẩu"
            secureTextEntry={secureTextEntry}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          >
            <Text style={styles.showText}>
              {secureTextEntry ? "HIỆN" : "ẨN"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotPassword}>Lấy lại mật khẩu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.faqLinkContainer}
          onPress={() => Alert.alert("Câu hỏi thường gặp")}
        >
          <Text style={styles.faqLink}>Câu hỏi thường gặp ›</Text>
        </TouchableOpacity>

        <View style={styles.buttonField}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              isButtonEnabled && styles.nextButtonEnabled,
            ]}
            onPress={handleLogin}
            disabled={!isButtonEnabled}
          >
            <View style={styles.nextButtonText}>
              <AntDesign name="arrowright" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default LoginScreen;
