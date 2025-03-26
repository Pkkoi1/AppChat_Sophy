import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Support for defaultProps will be removed"]);

const PhoneNumber = ({ onPhoneNumberChange }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const defaultCountry = "VN"; // Sử dụng giá trị mặc định bằng JS

  const handlePhoneNumberChange = (number) => {
    setPhoneNumber(number);
    if (onPhoneNumberChange) {
      onPhoneNumberChange(number);
    }
  };

  return (
    <View>
      <PhoneInput
        defaultCode={defaultCountry}
        placeholder=" "
        onChangeText={handlePhoneNumberChange}
        value={phoneNumber}
      />
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