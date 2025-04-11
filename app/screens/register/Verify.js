import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { sendOTP, verifyOTP, checkOTPStatus } from "../../services/OTPServices";
import { PermissionsAndroid, Platform } from "react-native";
const { width, height } = Dimensions.get("window");

const Verify = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { phoneNumber } = route.params || {};
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(46);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRefs = useRef([]);
  const isButtonEnabled = code.length === 6;

  // Tự động gửi OTP khi màn hình được mount
  useEffect(() => {
    handleSendOTP();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Xử lý gửi OTP
  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sendOTP(phoneNumber);
      if (response.success) {
        setTimeLeft(46);
        setCanResend(false);
      } else {
        setError("Không thể gửi mã OTP");
      }
    } catch (err) {
      setError(err.message || "Không thể gửi mã OTP");
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý gửi lại OTP
  const handleResend = async () => {
    if (canResend) {
      await handleSendOTP();
      setCode("");
      inputRefs.current[0]?.focus();
    }
  };

  // Xử lý xác thực OTP
  const handleVerify = async () => {
    if (isButtonEnabled) {
      try {
        setIsLoading(true);
        setError(null);
        const response = await verifyOTP(phoneNumber, code);
        if (response.success) {
          navigation.navigate("CreateProfile", { phoneNumber });
        } else {
          setError("Mã OTP không chính xác");
        }
      } catch (err) {
        setError(err.message || "Không thể xác thực mã OTP");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Xử lý nhập mã
  const handleInputChange = (value, index) => {
    const newCode = code.split("");
    newCode[index] = value;
    const updatedCode = newCode.join("");
    setCode(updatedCode);

    if (value) {
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Xử lý phím backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập mã xác thực</Text>
      <Text style={styles.subtitle}>
        Đang gọi đến số <Text style={styles.phoneNumber}>{phoneNumber}</Text>.
        Nghe máy để nhận mã xác thực gồm 6 chữ số.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.codeInputContainer}>
        {Array(6)
          .fill("")
          .map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.codeInput, code[index] && styles.codeInputFilled]}
              maxLength={1}
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={code[index] || ""}
              selectTextOnFocus
            />
          ))}
      </View>

      <TouchableOpacity
        style={[styles.button, isButtonEnabled && styles.buttonEnabled]}
        disabled={!isButtonEnabled}
        onPress={handleVerify}
      >
        <Text
          style={[
            styles.buttonText,
            isButtonEnabled && styles.buttonTextEnabled,
          ]}
        >
          Tiếp tục
        </Text>
      </TouchableOpacity>

      <Text style={styles.resendText}>
        Bạn không nhận được mã?{" "}
        <Text
          style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}
          onPress={handleResend}
        >
          Gọi lại {timeLeft > 0 ? `(${timeLeft}s)` : ""}
        </Text>
      </Text>

      <TouchableOpacity
        style={styles.supportLinkContainer}
        onPress={() => {
          console.log("Need support");
        }}
      >
        <Text style={styles.supportLink}>
          Tôi cần hỗ trợ thêm về mã xác thực
        </Text>
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1068fe" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 30,
  },
  phoneNumber: {
    fontWeight: "bold",
    color: "#000",
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  codeInput: {
    width: width * 0.12,
    height: width * 0.12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    color: "#000",
  },
  codeInputFilled: {
    borderColor: "#1068fe",
    backgroundColor: "#f8f9fa",
  },
  button: {
    backgroundColor: "#e0e0e0",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonEnabled: {
    backgroundColor: "#1068fe",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#a7acb2",
  },
  buttonTextEnabled: {
    color: "#fff",
  },
  resendText: {
    fontSize: 14,
    textAlign: "center",
    color: "#6c757d",
    marginBottom: 20,
  },
  resendLink: {
    color: "#1068fe",
    fontWeight: "bold",
  },
  resendLinkDisabled: {
    color: "#6c757d",
  },
  supportLinkContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
  },
  supportLink: {
    fontSize: 14,
    color: "#1068fe",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 999,
  },
});

export default Verify;
