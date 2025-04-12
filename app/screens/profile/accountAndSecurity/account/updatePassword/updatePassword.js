import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";

const UpdatePassword = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState(""); // Thêm trạng thái lỗi cho mật khẩu hiện tại
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const { authToken, logout, userInfo, login } = useContext(AuthContext);

  const handlePasswordUpdate = async () => {
    setErrorMessage("");
    setCurrentPasswordError(""); // Reset lỗi mật khẩu hiện tại

    if (!currentPassword) {
      setCurrentPasswordError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (!authToken) {
      setErrorMessage("Không tìm thấy token. Vui lòng đăng nhập lại.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true); // Bắt đầu loading
    try {
      const response = await api.changePassword(
        userInfo.userId,
        currentPassword,
        newPassword
      );

      if (response.message === "Password changed successfully") {
        try {
          // await logout();
          // await login({
          //   phone: userInfo.phone,
          //   password: newPassword,
          // });
          

          Alert.alert("Thành công", "Mật khẩu đã được cập nhật thành công!");
          navigation.navigate("AccountAndSecurity");
        } catch (loginError) {
          console.error("Lỗi khi đăng nhập lại:", loginError);
          Alert.alert("Lỗi", "Không thể đăng nhập lại. Vui lòng thử lại.");
        }
      } else {
        // Cập nhật để trả về thông báo lỗi từ backend
        setErrorMessage(response.message);
      }
    } catch (error) {
      // Cập nhật để trả về thông báo lỗi từ backend
      if (error.message === "Invalid password") {
        setCurrentPasswordError("Mật khẩu hiện tại không đúng.");
      } else if (error.response?.status === 400) {
        // Lỗi từ backend do mật khẩu mới không đủ mạnh
        setErrorMessage(
          error.response.data.message || "Mật khẩu mới không hợp lệ."
        );
      } else if (error.response?.status === 401) {
        // Lỗi từ backend do mật khẩu hiện tại không đúng
        setCurrentPasswordError(
          error.response.data.message || "Mật khẩu hiện tại không đúng."
        );
      } else if (error.response?.status === 404) {
        // Lỗi từ backend do không tìm thấy user
        setErrorMessage(
          error.response.data.message || "Không tìm thấy người dùng."
        );
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  return (
    <View style={styles.container}>
      <OptionHeader title="Thay đổi mật khẩu" />
      <Text style={styles.subtitle}>
        Mật khẩu phải gồm chữ và số, không được chứa năm sinh, username và tên
        Zalo của bạn.
      </Text>

      <View style={[styles.inputContainer, { paddingHorizontal: 15 }]}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Mật khẩu hiện tại:</Text>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggleText}>
              {showPassword ? "ẨN" : "HIỆN"}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu hiện tại"
          secureTextEntry={!showPassword}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        {currentPasswordError ? (
          <Text style={styles.errorText}>{currentPasswordError}</Text>
        ) : null}
      </View>

      <View style={[styles.inputContainer, { paddingHorizontal: 15 }]}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Mật khẩu mới:</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới"
          secureTextEntry={!showPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      <View style={[styles.inputContainer, { paddingHorizontal: 15 }]}>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu mới"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
      {isLoading ? ( // Hiển thị loading khi đang xử lý
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <TouchableOpacity
          style={[
            styles.updateButton,
            currentPassword && newPassword && confirmPassword
              ? styles.updateButtonEnabled
              : null,
          ]}
          onPress={handlePasswordUpdate}
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          <Text style={styles.updateButtonText}>CẬP NHẬT</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 15,
    backgroundColor: "#F0F4F3",
    width: "100%",
    height: 40,
    lineHeight: 40,
  },
  inputContainer: {
    width: "100%",
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#007AFF",
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
    paddingHorizontal: 10,
  },
  toggleText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "bold",
  },
  updateButton: {
    backgroundColor: "#CED4DA",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "50%",
    alignSelf: "center",
  },
  updateButtonEnabled: {
    backgroundColor: "#007AFF",
  },
  updateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorMessage: {
    fontSize: 14,
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginTop: -10,
    marginBottom: 10,
    textAlign: "left",
    paddingHorizontal: 10,
  },
});

export default UpdatePassword;
