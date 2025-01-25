import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import PhoneNumber from "../../../../components/Screens/PhoneNumber/PhoneNumber";
import { CheckBox } from "@rneui/themed";

const { width, height } = Dimensions.get("window");

const Register = () => {
  const navigation = useNavigation();
  const [isSelected, setSelection] = useState(false);

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
      <View style={styles.phone_field}>
        <Text style={styles.app_name}>Nhập số điện thoại</Text>
        <PhoneNumber />
      </View>
      <View style={styles.clause_field}>
        <View style={styles.check_option}>
          <CheckBox
            checked={isSelected}
            onPress={() => setSelection(!isSelected)}
            iconType="material-community"
            checkedIcon="checkbox-outline"
            uncheckedIcon="checkbox-blank-outline"
          />
          <Text>Tôi đồng ý với các </Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.linkText}>điều khoản sử dụng Sophy</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.check_option}>
          <CheckBox
            checked={isSelected}
            onPress={() => setSelection(!isSelected)}
            iconType="material-community"
            checkedIcon="checkbox-outline"
            uncheckedIcon="checkbox-blank-outline"
          />
          <Text>Tôi đồng ý với </Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.linkText}>
              điều khoản Mạng xã hội của Sophy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.submit}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Verify")}
          style={styles.button_not_checked}
        >
          <Text style={styles.submit_text}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer_option}>
        <Text>Đã có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  phone_field: {
    width: width * 0.9,
    height: height * 0.3,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    top: -20,
  },
  app_name: {
    fontSize: 30,
    alignItems: "center",
    textAlign: "center",
    color: "black",
    fontWeight: "500",
    marginBottom: 20,
  },
  linkText: {
    color: "#0c8de8",
    textDecorationLine: "none",
    fontWeight: "bold",
  },
  text_style: {
    fontWeight: "regular",
  },
  clause_field: {
    display: "flex",
    flexDirection: "column",
    top: height * -0.1,
  },
  check_option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 0,
    marginBottom: -20,
  },
  submit: {
    alignItems: "center",
    top: height * -0.03,
  },
  button_not_checked: {
    backgroundColor: "#e0e0e0",
    width: width * 0.9,
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  submit_text: {
    color: "#a7acb2",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer_option: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
  },
});

export default Register;
