import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";

const UpdatePassword = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { authToken, logout } = useContext(AuthContext);

  const handlePasswordUpdate = async () => {
    if (!authToken) {
      setErrorMessage("Không tìm thấy token. Vui lòng đăng nhập lại.");
      return;
    }

    if (newPassword === confirmPassword && newPassword.length >= 6) {
      try {
        const response = await api.changePassword(currentPassword, newPassword);
        if (response.message === "Password changed successfully") {
          Alert.alert("Thành công", "Mật khẩu đã được cập nhật thành công!");
          navigation.goBack();
        } else {
          setErrorMessage(response.message || "Không thể cập nhật mật khẩu. Vui lòng thử lại.");
        }
      } catch (error) {
        if (error.message === "Không tìm thấy authToken. Yêu cầu đăng nhập lại.") {
          Alert.alert("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.", [
            { text: "OK", onPress: () => logout() },
          ]);
        }
        setErrorMessage(error.message || "Có lỗi xảy ra khi cập nhật mật khẩu.");
      }
    } else {
      if (newPassword !== confirmPassword) {
        setErrorMessage("Mật khẩu mới không khớp.");
      } else {
        setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <OptionHeader title="Thay đổi mật khẩu" previousScreen="AccountAndSecurity" />
      <Text style={styles.subtitle}>
        Mật khẩu phải gồm chữ và số, không được chứa năm sinh, username và tên Zalo của bạn.
      </Text>

      <View style={[styles.inputContainer, { paddingHorizontal: 15 }]}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Mật khẩu hiện tại:</Text>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggleText}>{showPassword ? "ẨN" : "HIỆN"}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu hiện tại"
          secureTextEntry={!showPassword}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
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
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      <TouchableOpacity
        style={[styles.updateButton, currentPassword && newPassword && confirmPassword ? styles.updateButtonEnabled : null]}
        onPress={handlePasswordUpdate}
        disabled={!currentPassword || !newPassword || !confirmPassword}
      >
        <Text style={styles.updateButtonText}>CẬP NHẬT</Text>
      </TouchableOpacity>
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
});

export default UpdatePassword;
