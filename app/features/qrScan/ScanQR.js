import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Camera, useCameraPermissions, CameraView } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../api/api";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "../../socket/SocketContext";

const { width, height } = Dimensions.get("window");

export default function ScanQR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);
  const navigation = useNavigation(); // Khởi tạo navigation

  // Kiểm tra context trước khi sử dụng
  const { userInfo, authToken } = useContext(AuthContext) || {};
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (scanned && qrData) {
      const verifyQrCode = async () => {
        try {
          const qrInfo = JSON.parse(qrData);
          console.log("Scanned qrInfo.token:", qrInfo.token);
          const response = await api.verifyQrToken(qrInfo.token);
          console.log("API verifyQrToken response:", response); // Debug log

          if (response.message === "QR token verified successfully") {
            console.log("QR token verified successfully:", response.data);
            if (socket) {
              console.log("Socket is connected:", socket.connected);
              // Modified socket emit to match server expectations
              socket.emit("scanQrLogin", {
                qrToken: qrInfo.token,
                userId: userInfo.userId,
              });
              console.log("Emitted 'scanQrLogin' event with data:", {
                qrToken: qrInfo.token,
                userId: userInfo.userId,
              });

              // Add socket response listener
              socket.on("qrScanned", (data) => {
                console.log("QR scan acknowledged by server:", data);
              });
            }
            navigation.navigate("LoginByQR", { qrData: qrData });
          } else {
            Alert.alert("Lỗi", "Mã QR không hợp lệ.");
            setScanned(false);
            setQrData(null);
          }
        } catch (error) {
          console.error("Error verifying QR token:", error);
          Alert.alert("Lỗi", "Không thể xác minh mã QR. Vui lòng thử lại.");
          setScanned(false);
          setQrData(null);
        }
      };

      verifyQrCode();
    }
  }, [scanned, qrData, navigation, socket, userInfo, authToken]);

  const handleBarCodeScanned = ({ type, data }) => {
    console.log("QR code scanned:", data); // Log the scanned data
    setScanned(true);
    setQrData(data);
  };

  const handleLinkPress = () => {
    if (isValidUrl(qrData)) {
      Linking.openURL(qrData);
    } else {
      Alert.alert("Lỗi", "Địa chỉ không hợp lệ.");
    }
  };

  if (!permission) {
    return (
      <Text style={styles.text}>Đang kiểm tra quyền truy cập camera...</Text>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Ứng dụng cần quyền truy cập camera để quét mã QR.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cho phép truy cập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topLeftCorner} />
          <View style={styles.topRightCorner} />
          <View style={styles.bottomLeftCorner} />
          <View style={styles.bottomRightCorner} />
        </View>
      </CameraView>
    </View>
  );
}

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderColor: "#fff",
    borderWidth: 2,
  },
  topLeftCorner: {
    position: "absolute",
    top: 300,
    left: 100,
    width: 30,
    height: 30,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#fff",
  },
  topRightCorner: {
    position: "absolute",
    top: 300,
    right: 100,
    width: 30,
    height: 30,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: "#fff",
  },
  bottomLeftCorner: {
    position: "absolute",
    bottom: 300,
    left: 100,
    width: 30,
    height: 30,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#fff",
  },
  bottomRightCorner: {
    position: "absolute",
    bottom: 300,
    right: 100,
    width: 30,
    height: 30,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: "#fff",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  linkText: {
    color: "#42a5f5",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#42a5f5",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});