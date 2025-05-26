import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "../../api/api";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { AuthContext } from "@/app/auth/AuthContext"; // Import AuthContext
import { SocketContext } from "../../socket/SocketContext";

const LoginByQR = ({ route, navigation }) => {
  const [isChecked, setIsChecked] = useState(false);
  const { qrData } = route.params || {};
  const { login } = useContext(AuthContext); // Get login function from context
  const { socket } = useContext(SocketContext);

  const handleLogin = async () => {
    if (!isChecked) {
      Alert.alert("Thông báo", "Vui lòng xác nhận đây là thiết bị của bạn.");
      return;
    }

    try {
      const qrInfo = JSON.parse(qrData);
      console.log("Confirm qrInfo.token:", qrInfo.token);

      // Gọi API để xác nhận QR login
      const response = await api.confirmQrLogin(qrInfo.token);

      if (response.message === "QR login confirmed successfully") {
        // Kiểm tra socket và gửi sự kiện confirmQrLogin
        if (socket && socket.connected) {
          socket.emit("confirmQrLogin", {
            qrToken: qrInfo.token,
            confirmed: true,
            token: response.data.token, // Token từ API response
          });
          console.log(
            "Socket event 'confirmQrLogin' emitted with token:",
            qrInfo.token
          );
        } else {
          console.error("Socket is not connected!");
          Alert.alert("Lỗi", "Không thể kết nối đến server. Vui lòng thử lại.");
          return;
        }

        // Thông báo thành công và chuyển hướng
        Alert.alert("Thành công", "Bạn đã đăng nhập thành công!");
        navigation.navigate("Home");
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Không thể xác nhận đăng nhập. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Error confirming QR login:", error);
      if (error.response?.status === 404) {
        Alert.alert("Lỗi", "QR token không tồn tại hoặc đã hết hạn.");
      } else if (error.response?.status === 400) {
        Alert.alert("Lỗi", "QR token chưa được quét.");
      } else if (error.response?.status === 403) {
        Alert.alert("Lỗi", "Không có quyền xác nhận QR token này.");
      } else {
        Alert.alert("Lỗi", "Không thể xác nhận đăng nhập. Vui lòng thử lại.");
      }
    }
  };

  const handleReject = () => {
    if (socket) {
      const qrInfo = JSON.parse(qrData);
      socket.emit("confirmQrLogin", {
        qrToken: qrInfo.token,
        confirmed: false,
      });
    }
    Alert.alert("Thông báo", "Bạn đã từ chối đăng nhập.");
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đăng nhập</Text>
      </View>

      <View style={styles.iconContainer}>
        <MaterialIcons
          name="computer"
          size={100}
          color="#000"
          style={styles.icon}
        />
      </View>
      <Text style={styles.title}>
        Đăng nhập Sophy Web bằng mã QR trên thiết bị lạ?
      </Text>

      {/* Warning */}
      <View style={styles.warningContainer}>
        <Text style={styles.warning}>
          Tài khoản có thể bị chiếm đoạt nếu đây không phải thiết bị của bạn.
        </Text>
        <Text style={styles.description}>
          Bấm Từ chối nếu ai đó yêu cầu bạn đăng nhập bằng mã QR để bình chọn,
          trúng thưởng, nhận khuyến mãi,...
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trình duyệt:</Text>
          <Text style={styles.infoValue}>Chrome - Windows 10</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Thời gian:</Text>
          <Text style={styles.infoValue}>12:51 - 09/04/2025</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa điểm:</Text>
          <Text style={styles.infoValue}>Hồ Chí Minh, Việt Nam</Text>
        </View>
      </View>

      {/* Checkbox */}
      <View style={styles.checkboxContainer}>
        <BouncyCheckbox
          size={25}
          fillColor="#007bff"
          unfillColor="#FFFFFF"
          text="Tôi đã kiểm tra kỹ thông tin và xác nhận đây là thiết bị của tôi"
          iconStyle={{ borderColor: "#007bff" }}
          textStyle={{
            fontFamily: "JosefinSans-Regular",
            fontSize: 14,
            color: "#495057",
          }}
          onPress={(isChecked) => {
            setIsChecked(isChecked);
          }}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            isChecked ? styles.loginButton : styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={!isChecked}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
          <Text style={styles.rejectButtonText}>Từ chối</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 20,
  },
  image: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  warningContainer: {
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  warning: {
    color: "#721c24",
    fontSize: 14,
  },
  description: {
    color: "#721c24",
    fontSize: 14,
  },
  infoContainer: {
    marginBottom: 15,
    alignItems: "flex-start", // Align items to the start
  },
  infoRow: {
    flexDirection: "row", // Arrange label and value horizontally
    alignItems: "center", // Vertically align label and value
    marginBottom: 5, // Add spacing between rows
  },
  infoLabel: {
    fontSize: 14,
    color: "#495057",
    marginRight: 5, // Add spacing between label and value
    fontWeight: "bold", // Make the label bold
  },
  infoValue: {
    fontSize: 14,
    color: "#495057",
  },
  info: {
    fontSize: 14,
    color: "#495057",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 14,
    color: "#495057",
    marginLeft: 10,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: "#007bff", // Active login button color
  },
  disabledButton: {
    backgroundColor: "#6c757d", // Disabled login button color
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  rejectButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 5,
  },
  rejectButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    marginBottom: 10,
  },
});

export default LoginByQR;
