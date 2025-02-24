import React from "react";
import { StyleSheet, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Support for defaultProps will be removed"]);

const PhoneNumber = () => {
  const defaultCountry = "VN"; // Sử dụng giá trị mặc định bằng JS
  return (
    <View>
      <PhoneInput defaultCode={defaultCountry} placeholder=" " />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
  },
});

export default PhoneNumber;
