import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect, useState } from "react";
import contaier from "../../../components/container/ContainerStyle";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import PhoneNumber from "../../../components/phoneNumber/PhoneNumber";
import { CheckBox } from "@rneui/themed";
import RegisterStyle from "./RegisterStyle";

const { width, height } = Dimensions.get("window");
const Register = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation();
  const [isSelected1, setSelection1] = useState(false);
  const [isSelected2, setSelection2] = useState(false);
  const [isPhoneNumberFilled, setIsPhoneNumberFilled] = useState(false); // New state
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

  const isButtonEnabled = isSelected1 && isSelected2 && isPhoneNumberFilled;

  return (
    <View style={contaier.main}>
      <View style={RegisterStyle({ width, height }).phone_field}>
        <Text style={RegisterStyle({ width, height }).app_name}>
          Nhập số điện thoại
        </Text>
        <PhoneNumber onPhoneNumberChange={handlePhoneNumberChange} />
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
          onPress={() => navigation.navigate("Verify", { phoneNumber: phoneNumber })}
          style={[
            RegisterStyle({ width, height }).button_not_checked,
            isButtonEnabled &&
              RegisterStyle({ width, height }).button_checked,
          ]}
          disabled={!isButtonEnabled}
        >
          <Text style={[
              RegisterStyle({ width, height }).submit_text,
              isButtonEnabled && { color: '#fff' } // Change text color to white when enabled
            ]}
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
    </View>
  );
};

export default Register;