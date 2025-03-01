import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView, // Import SafeAreaView
  StyleSheet,
  StatusBar,
} from "react-native";
import styles from "./Login.style";
import { FAB } from "react-native-elements";
import Icon from "react-native-vector-icons/Ionicons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AntDesign } from "@expo/vector-icons";

function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    setIsButtonEnabled(phone.length > 0 && password.length > 0);
  }, [phone, password]);

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    Alert.alert("Đăng nhập thành công!", `Số điện thoại: ${phone}`);
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} backgroundColor="#007AFF">
      <StatusBar
        barStyle="light-content" // Chỉnh màu chữ của status bar
        backgroundColor="#1b96fd" // Chỉnh màu nền của status bar
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
