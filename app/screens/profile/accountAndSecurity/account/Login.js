import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Switch } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Color from "@/app/components/colors/Color"; // Đường dẫn đến Color.js
const Login = ({ navigation }) => {
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Đăng nhập</Text>

      <View style={styles.loginRow}>
        <AntDesign name="Safety" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.loginText}>Bảo mật 2 lớp</Text>
          <Text style={styles.loginDescription}>
            Thêm hình thức xác nhận để bảo vệ tài khoản khi đăng nhập trên thiết bị mới
          </Text>
        </View>
        <Switch
          value={isTwoFactorEnabled}
          onValueChange={(value) => setIsTwoFactorEnabled(value)}
        />
      </View>

      <TouchableOpacity
        style={styles.loginRow}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("DeviceManagement");
        }}
      >
        <AntDesign name="mobile1" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.loginText}>Thiết bị đăng nhập</Text>
          <Text style={styles.loginDescription}>
            Quản lý các thiết bị bạn sử dụng để đăng nhập Zalo
          </Text>
        </View>
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginRow}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("UpdatePassword"); // Chuyển đến trang UpdatePassword
        }}
      >
        <AntDesign name="lock" size={24} color="grey" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.loginText}>Mật khẩu</Text>
        </View>
        <AntDesign name="right" size={20} color="grey" />
      </TouchableOpacity>
      <View style={styles.lastInfoRow} />

      <TouchableOpacity
        style={[styles.deleteAccountRow]}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("DeleteAccount");
        }}
      >
        <Text style={styles.deleteAccountText}>Xóa tài khoản</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Color.blueText2,
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 15,
    width: 24, // Đảm bảo icon có kích thước cố định
  },
  textContainer: {
    flex: 1,
  },
  loginText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 3,
  },
  loginDescription: {
    fontSize: 14,
    color: "grey",
  },
  deleteAccountRow: {
    paddingVertical: 20,
  },
  deleteAccountText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  lastInfoRow: {
    borderBottomWidth: 10,
    borderBottomColor: "#eee",
    marginHorizontal: -20,
    marginTop: -1,
  },
});

export default Login;