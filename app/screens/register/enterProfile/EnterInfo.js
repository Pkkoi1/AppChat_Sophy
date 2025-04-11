import React, { useContext, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons"; // Import icon lịch
import Feather from "@expo/vector-icons/Feather"; // Import Feather icons
import Color from "../../../components/colors/Color";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";
import { Icon, Overlay } from "@rneui/themed";

const EnterInfo = ({ route, navigation }) => {
  const { register } = useContext(AuthContext);

  const { phoneNumber, fullname } = route.params || {
    phoneNumber: "0123456789",
    fullname: "Nguyễn Văn A",
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "",
      headerStyle: {
        backgroundColor: "#fff",
        shadowColor: "#fff",
        elevation: 0,
      },
    });
  }, [navigation]);

  const [date, setDate] = useState(new Date("2000-01-01")); // Mặc định ngày sinh
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("Nam"); // Mặc định giới tính
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // Lỗi định dạng mật khẩu
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Theo dõi trạng thái bàn phím
  const [success, setSuccess] = useState(false); // Trạng thái hiển thị thông báo thành công
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password visibility

  const sanitizedPhoneNumber = phoneNumber.replace(/\s+/g, "");
  const [visible, setVisible] = useState(true);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ và số, và không chứa ký tự đặc biệt."
      );
    } else {
      setPasswordError(""); // Xóa lỗi nếu hợp lệ
    }
  };

  const validateDateOfBirth = (date) => {
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    );
    const maxDate = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate()
    );
    return date >= minDate && date <= maxDate;
  };

  const handleNext = async () => {
    if (!date || !gender || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (!validateDateOfBirth(date)) {
      setError("Ngày sinh phải từ đủ 13 đến 100 tuổi.");
      return;
    }

    if (passwordError) {
      setError("Mật khẩu không hợp lệ.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    setError(""); // Xóa lỗi nếu hợp lệ

    const isMale = gender === "Nam";

    const payload = {
      phone: sanitizedPhoneNumber,
      password,
      fullname,
      isMale,
      birthday: date.toISOString().split("T")[0],
    };

    try {
      setLoading(true);
      // Gửi yêu cầu đăng ký
      await register(payload);

      setLoading(false);
      setSuccess(true); // Hiển thị thông báo thành công

      // Chuyển sang trang EnterAvatar sau 3 giây
      setTimeout(() => {
        navigation.navigate("EnterAvatar");
        setVisible(false); // Đóng overlay sau khi chuyển trang
        setSuccess(false); // Reset success state
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error("Lỗi đăng ký hoặc đăng nhập:", error);

      Alert.alert(
        "Lỗi",
        error.message || "Đăng ký tài khoản thất bại. Vui lòng thử lại."
      );
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // Lắng nghe sự kiện bàn phím
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (success) {
    return (
      <Overlay
        isVisible={visible}
        overlayStyle={{
          borderRadius: 10,
          padding: 20,
          backgroundColor: "white",
          alignItems: "center",
        }}
      >
        <Icon name="check-circle" type="feather" color="green" size={30} />
        <Text style={{ marginTop: 10, textAlign: "center" }}>
          Tạo tài khoản mới thành công
        </Text>
      </Overlay>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }} // Thay đổi chiều cao khi bàn phím xuất hiện
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            { height: isKeyboardVisible ? "120%" : "100%" },
            styles.scrollContainer,
          ]}
        >
          <View style={styles.container}>
            <Text style={styles.header}>Thêm thông tin cá nhân</Text>

            {/* Nhập ngày sinh */}
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString("vi-VN")}
              </Text>
              <MaterialIcons name="calendar-today" size={20} color="#000" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {/* Chọn giới tính */}
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
              >
                <Picker.Item label="Nam" value="Nam" />
                <Picker.Item label="Nữ" value="Nữ" />
              </Picker>
            </View>

            {/* Nhập mật khẩu */}
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  validatePassword(value); // Kiểm tra định dạng mật khẩu
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)} // Use functional state update
                activeOpacity={0.7} // Improve button responsiveness
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={19}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            {/* Xác nhận mật khẩu */}
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)} // Use functional state update
                activeOpacity={0.7} // Improve button responsiveness
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={19}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>
                Mật khẩu và xác nhận mật khẩu không khớp.
              </Text>
            )}

            {/* Hiển thị lỗi nếu có */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Hiển thị loading */}
            {loading && <ActivityIndicator size="large" color={Color.sophy} />}

            {/* Nút tiếp tục */}
            <TouchableOpacity
              onPress={handleNext}
              style={styles.button}
              disabled={loading}
              activeOpacity={0.7} // Improve button responsiveness
            >
              <Text style={styles.buttonText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: Color.gray,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "transparent",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Color.sophy,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  successIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
});

export default EnterInfo;
