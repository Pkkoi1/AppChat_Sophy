import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect, useState } from "react";
import contaier from "@/components/Container/ContainerStyle";
import RegisterStyle from "@/components/Register/RegisterStyle";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import PhoneNumber from "../../../components/Screens/PhoneNumber/PhoneNumber";
import { CheckBox } from "@rneui/themed";

const { width, height } = Dimensions.get("window");
const Register = () => {
  const navigation = useNavigation();
  const [isSelected1, setSelection1] = useState(false);
  const [isSelected2, setSelection2] = useState(false);
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
    <View style={contaier.main}>
      <View style={RegisterStyle({ width, height }).phone_field}>
        <Text style={RegisterStyle({ width, height }).app_name}>Nhập số điện thoại</Text>
        <PhoneNumber />
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
          <TouchableOpacity onPress={() => { }}>
            <Text style={RegisterStyle({ width, height }).linkText}>điều khoản sử dụng Sophy</Text>
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
          <TouchableOpacity onPress={() => { }}>
            <Text style={RegisterStyle({ width, height }).linkText}>
              điều khoản Mạng xã hội của Sophy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={RegisterStyle({ width, height }).submit}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Verify")}
          style={RegisterStyle({ width, height }).button_not_checked}
        >
          <Text style={RegisterStyle({ width, height }).submit_text}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>

      <View style={RegisterStyle({ width, height }).footer_option}>
        <Text>Đã có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={RegisterStyle({ width, height }).linkText}> Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Register;