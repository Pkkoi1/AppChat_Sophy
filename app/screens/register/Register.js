import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect, useState } from "react";
import contaier from "../../components/container/ContainerStyle";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import PhoneNumber from "../../components/phoneNumber/PhoneNumber";
import { CheckBox, Overlay } from "@rneui/themed";
import RegisterStyle from "./RegisterStyle";
import VerifyPhoneNumber from "./verifyPhoneNumber/VerifyPhoneNumber";
import { api } from "../../api/api"; // Import API

const { width, height } = Dimensions.get("window");

const Register = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSelected1, setSelection1] = useState(false);
  const [isSelected2, setSelection2] = useState(false);
  const [isPhoneNumberFilled, setIsPhoneNumberFilled] = useState(false); // New state
  const [visible, setVisible] = useState(false);

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

  const handlePhoneNumberChange = (phoneNumber) => {
    setPhoneNumber(phoneNumber);
    setIsPhoneNumberFilled(phoneNumber.length > 9);
  };

  const handleContinue = async () => {
    if (!isSelected1 || !isSelected2 || phoneNumber.trim() === "") {
      Alert.alert(
        "Thông báo",
        "Bạn cần nhập số điện thoại và đồng ý với các điều khoản để tiếp tục."
      );
      return;
    }

    try {
      // Kiểm tra số điện thoại qua API
      const response = await api.checkPhone(
        phoneNumber.trim().replace(/\s+/g, "")
      );
      if (response) {
        // Nếu số điện thoại đã tồn tại, hiển thị thông báo
        // console.log("Số điện thoại chưa được sử dụng, tiếp tục xác minh.");
        setVisible(true); // Hiển thị VerifyPhoneNumber
      }
    } catch (error) {
      // console.error("Lỗi khi kiểm tra số điện thoại:", error);
      Alert.alert("Lỗi", "Số điện thoại đã được sử dụng.\nVui lòng thử lại.");
    }
  };
  return (
    <View style={contaier.main}>
      <View style={RegisterStyle({ width, height }).phone_field}>
        <Text style={RegisterStyle({ width, height }).app_name}>
          Nhập số điện thoại
        </Text>
        <PhoneNumber onChange={(value) => setPhoneNumber(value)} />
      </View>
      <View style={RegisterStyle({ width, height }).clause_field}>
        <View style={RegisterStyle({ width, height }).check_option}>
          <CheckBox
            checked={isSelected1}
            onPress={() => setSelection1(!isSelected1)}
            iconType="material-community"
            checkedIcon="checkbox-outline"
            uncheckedIcon="checkbox-blank-outline"
          />
          <Text>Tôi đồng ý với các </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("TermsOfService")}
          >
            <Text style={RegisterStyle({ width, height }).linkText}>
              điều khoản sử dụng Sophy
            </Text>
          </TouchableOpacity>
        </View>
        <View style={RegisterStyle({ width, height }).check_option}>
          <CheckBox
            checked={isSelected2}
            onPress={() => setSelection2(!isSelected2)}
            iconType="material-community"
            checkedIcon="checkbox-outline"
            uncheckedIcon="checkbox-blank-outline"
          />
          <Text>Tôi đồng ý với </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("SocialNetworkTerms")}
          >
            <Text style={RegisterStyle({ width, height }).linkText}>
              điều khoản Mạng xã hội của Sophy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={RegisterStyle({ width, height }).submit}>
        <TouchableOpacity
          onPress={handleContinue} // Gọi hàm kiểm tra số điện thoại
          style={
            isSelected1 && isSelected2
              ? RegisterStyle({ width, height }).button_checked
              : RegisterStyle({ width, height }).button_not_checked
          }
        >
          <Text
            style={
              isSelected1 && isSelected2
                ? RegisterStyle({ width, height }).submit_text_checked
                : RegisterStyle({ width, height }).submit_text
            }
          >
            Tiếp tục
          </Text>
        </TouchableOpacity>
      </View>

      <View style={RegisterStyle({ width, height }).footer_option}>
        <Text>Đã có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={RegisterStyle({ width, height }).linkText}>
            {" "}
            Đăng nhập ngay
          </Text>
        </TouchableOpacity>
      </View>
      <Overlay isVisible={visible} onBackdropPress={() => setVisible(false)}>
        <VerifyPhoneNumber
          phoneNumber={phoneNumber} // Truyền số điện thoại
          onCancel={() => setVisible(false)} // Hàm tắt Overlay
        />
      </Overlay>
    </View>
  );
};

export default Register;
