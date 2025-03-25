import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { RadioButton } from "react-native-paper";
import Color from "../../../../components/colors/Color";

const EnterInfo = ({ phoneNumber, fullname, navigation }) => {
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
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!day || !month || !year || !gender || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (parseInt(day) < 1 || parseInt(day) > 31) {
      setError("Ngày không hợp lệ.");
      return;
    }

    if (parseInt(month) < 1 || parseInt(month) > 12) {
      setError("Tháng không hợp lệ.");
      return;
    }

    if (parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear()) {
      setError("Năm không hợp lệ.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setError(""); // Xóa lỗi nếu hợp lệ
    const birthDate = `${day.padStart(2, "0")}-${month.padStart(
      2,
      "0"
    )}-${year}`;
    console.log("Thông tin hợp lệ:", { birthDate, gender, password });
    // Điều hướng sang màn hình tiếp theo hoặc xử lý logic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nhập thông tin cá nhân</Text>

      {/* Nhập ngày sinh */}
      <Text style={styles.label}>Ngày sinh</Text>
      <View style={styles.birthDateContainer}>
        <TextInput
          style={[styles.input, styles.birthDateInput]}
          placeholder="DD"
          value={day}
          onChangeText={setDay}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.birthDateInput]}
          placeholder="MM"
          value={month}
          onChangeText={setMonth}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.birthDateInput]}
          placeholder="YYYY"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      {/* Chọn giới tính */}
      <Text style={styles.label}>Giới tính</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={styles.genderOption}
          onPress={() => setGender("male")}
        >
          <RadioButton
            value="male"
            status={gender === "male" ? "checked" : "unchecked"}
            onPress={() => setGender("male")}
          />
          <Text>Nam</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.genderOption}
          onPress={() => setGender("female")}
        >
          <RadioButton
            value="female"
            status={gender === "female" ? "checked" : "unchecked"}
            onPress={() => setGender("female")}
          />
          <Text>Nữ</Text>
        </TouchableOpacity>
      </View>

      {/* Nhập mật khẩu */}
      <Text style={styles.label}>Mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Xác nhận mật khẩu */}
      <Text style={styles.label}>Xác nhận mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Hiển thị lỗi nếu có */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Nút tiếp tục */}
      <TouchableOpacity onPress={handleNext} style={styles.button}>
        <Text style={styles.buttonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: Color.gray,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  birthDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  birthDateInput: {
    flex: 1,
    marginHorizontal: 5,
    textAlign: "center",
  },
  genderContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
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
});

export default EnterInfo;
