import React from "react";
import { StyleSheet, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";

const PhoneNumber = () => {
  return (
    <View >
      <PhoneInput
        defaultCode="VN"
        placeholder=" "
       
      ></PhoneInput>
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
