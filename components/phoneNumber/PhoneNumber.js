import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Support for defaultProps will be removed"]);

const PhoneNumber = ({ onChange }) => {
  const [value, setValue] = useState(""); // Lưu số điện thoại
  const defaultCountry = "VN"; // Mã quốc gia mặc định

  const handleChange = (text) => {
    setValue(text); // Cập nhật trạng thái

    // Chuyển đổi số điện thoại từ dạng quốc tế sang dạng bắt đầu bằng 0
    const phoneNumber = parsePhoneNumberFromString(text, defaultCountry);
    const formattedNumber = phoneNumber
      ? phoneNumber.formatNational() // Định dạng số điện thoại dạng quốc gia
      : text;

    onChange(formattedNumber); // Truyền giá trị đã định dạng lên Register
  };

  return (
    <View>
      <PhoneInput
        defaultCode={defaultCountry}
        placeholder="Nhập số điện thoại"
        value={value}
        onChangeFormattedText={handleChange} // Gọi hàm khi số điện thoại thay đổi
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
