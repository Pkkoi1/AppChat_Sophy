import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator, // Thêm ActivityIndicator
} from "react-native";
import styles from "./Login.style";
import Icon from "react-native-vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "../../socket/SocketContext"; // Import SocketContext

function LoginScreen({ navigation }) {
  const { login, handlerRefresh } = useContext(AuthContext); // Lấy hàm login từ AuthContext
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Thêm state để quản lý trạng thái loading
  const { socket } = useContext(SocketContext); // Get socket from context

  useEffect(() => {
    setIsButtonEnabled(phone.length > 0 && password.length > 0);
  }, [phone, password]);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setIsLoading(true); // Bắt đầu loading

    try {
      // Gọi hàm login từ AuthContext
      await login({ phone, password });
      await handlerRefresh(); // Gọi hàm refresh để cập nhật dữ liệu
      setIsLoading(false); // Kết thúc loading
      Alert.alert("Đăng nhập thành công!", `Chào ${phone}!`);

      navigation.navigate("Home"); // Điều hướng đến màn hình chính
    } catch (error) {
      setIsLoading(false); // Kết thúc loading khi có lỗi
      Alert.alert("Đăng nhập thất bại!", "Sai số điện thoại hoặc mật khẩu!");
      console.error("Lỗi đăng nhập:", error);
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
          onPress={() => navigation.navigate("ZaloFAQScreen")}
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
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AntDesign name="arrowright" size={24} color="white" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default LoginScreen;
