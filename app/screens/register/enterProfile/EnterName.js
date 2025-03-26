import { useNavigation } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import Color from "../../../../components/colors/Color";

const EnterName = ({ phoneNumber, navigation }) => {
  const [fullname, setFullname] = useState("");
  const [error, setError] = useState(""); // Trạng thái để lưu lỗi

  const handlefullnameChange = (value) => {
    // Xóa khoảng trắng thừa
    const trimmedValue = value.trim();
    const regex =
      /^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưĂ-ỹ][a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưĂ-ỹ\s]{1,39}$/;

    setFullname(value); // Giữ nguyên giá trị đã nhập

    // Chỉ kiểm tra lỗi khi độ dài chuỗi lớn hơn 1 ký tự
    if (trimmedValue.length > 1 && !regex.test(trimmedValue)) {
      setError(
        "Tên phải bắt đầu bằng chữ cái viết hoa, không chứa số và dài từ 2 đến 40 ký tự."
      );
    } else {
      setError(""); // Xóa lỗi nếu hợp lệ
    }
  };

  const handleNext = () => {
    if (
      !fullname ||
      fullname.trim().length < 2 ||
      fullname.trim().length > 40
    ) {
      setError("Tên phải dài từ 2 đến 40 ký tự.");
      return;
    }

    if (
      !/^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưĂ-ỹ][a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưĂ-ỹ\s]*$/.test(
        fullname.trim()
      )
    ) {
      setError("Tên phải bắt đầu bằng chữ cái viết hoa và không chứa số.");
      return;
    }

    // Nếu hợp lệ, điều hướng sang màn hình tiếp theo
    navigation.navigate("EnterInfo", {
      phoneNumber,
      fullname: fullname.trim(),
      navigation,
    });
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nhập tên Sophy</Text>
      <Text style={styles.subHeader}>
        Hãy dùng tên thật để mọi người nhận ra bạn
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên của bạn"
        value={fullname}
        onChangeText={handlefullnameChange}
      />

      {/* Hiển thị lỗi nếu có */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.noteContainer}>
        <Text style={styles.noteItem}>• Dài từ 2 đến 40 ký tự</Text>
        <Text style={styles.noteItem}>• Không chứa số</Text>
        <Text style={styles.noteItem}>
          • Cần tuân thủ quy tắc đặt tên Sophy
        </Text>
      </View>

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
  subHeader: {
    fontSize: 15,
    color: Color.gray,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "red", // Màu chữ đỏ cho lỗi
    fontSize: 13,
    marginBottom: 10,
  },
  noteContainer: {
    marginTop: 10,
  },
  noteItem: {
    fontSize: 15,
    color: Color.gray,
    marginBottom: 5,
  },
  button: {
    backgroundColor: Color.sophy,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    position: "absolute",
    width: "100%",
    top: "95%",
    left: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default EnterName;
