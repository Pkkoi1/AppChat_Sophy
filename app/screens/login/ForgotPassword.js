import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal, // Import Modal
} from "react-native";
import styles from "./ForgotPassword.style";
import Icon from "react-native-vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import PhoneInput from "react-native-phone-number-input";
import { validatePhoneNumber } from 'react-native-phone-number-input';
import { api } from "../../api/api";

function ResetPasswordScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [tempPhone, setTempPhone] = useState(""); // Temporary phone number state
  const [formattedValue, setFormattedValue] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false); // State to control PhoneInput visibility
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State for confirmation modal visibility
  const phoneInput = useRef(null);

  useEffect(() => {
    setIsButtonEnabled(phone.length === 10);
    if (phone.length === 10) {
      setPhoneError(""); // Clear error if phone is 10 digits
    }
  }, [phone]);

  const handleResetPassword = async () => {
    if (!phone) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại!");
      return;
    }

    if (phone.length !== 10) {
      setPhoneError("Số điện thoại phải đúng 10 số.");
      return;
    }

    try {
      const fullNumber = `+84${phone}`;
      // const checkValid = await phoneInput.current?.isValidNumber(fullNumber);
      // if (!checkValid) {
      //   setPhoneError("Số điện thoại không hợp lệ.");
      //   setShowPhoneInput(true);
      //   return;
      // }

      // Gọi API checkPhone để kiểm tra số điện thoại và lấy OTP
      const checkPhoneResponse = await api.sendOtpForgotPassword(phone);

      // Nếu API trả về OTP, chuyển đến màn hình VerificationCode
      if (checkPhoneResponse && checkPhoneResponse.otp) {
        console.log("OTP:", checkPhoneResponse.otp);
        setShowConfirmationModal(false);
        navigation.navigate("VerificationCode", {
          phone: phone,
          otp: checkPhoneResponse.otp, // Truyền OTP sang màn hình VerificationCode
          otpId: checkPhoneResponse.otpId, // Truyền otpId sang màn hình VerificationCode
        });
      } else {
        // Xử lý trường hợp không nhận được OTP (ví dụ: hiển thị thông báo lỗi)
        Alert.alert(
          "Lỗi",
          "Không thể tạo mã OTP. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra số điện thoại:", error);
      setPhoneError(
        "Số điện thoại không tồn tại hoặc có lỗi xảy ra. Vui lòng kiểm tra lại."
      );
    }
  };

  const handlePhoneChange = (text) => {
    setPhone(text);
    setPhoneError("");
  };

  const handleTempPhoneChange = (text) => {
    setTempPhone(text);
    setPhone(text); // Update phone state with TextInput value
    setPhoneError("");
    setShowPhoneInput(false); // Hide PhoneInput when typing in TextInput
  };

  const handleConfirmReset = () => {
    // Perform reset password logic here
    setShowConfirmationModal(false); // Close the modal
    navigation.navigate("VerificationCode", { phone: phone }); // Navigate to VerificationCode screen
  };

  const handleCancelReset = () => {
    setShowConfirmationModal(false); // Close the modal
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lấy lại mật khẩu</Text>
      </View>

      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Nhập số điện thoại để lấy lại mật khẩu
        </Text>
      </View>

      {!showPhoneInput ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={tempPhone}
            onChangeText={handleTempPhoneChange}
          />
          <PhoneInput
            ref={phoneInput}
            value={phone} // Use value prop instead of defaultValue
            defaultCode="VN"
            layout="first"
            onChangeText={handlePhoneChange}
            onChangeFormattedText={(text) => {
              setFormattedValue(text);
            }}
            containerStyle={{ width: 0, height: 0 }} // Hide the PhoneInput
            textContainerStyle={{ display: 'none' }} // Hide the text container
            codeTextStyle={{ display: 'none' }} // Hide the code text
            textInputStyle={{ display: 'none' }} // Hide the text input
            countryPickerButtonStyle={{ display: 'none' }} // Hide the country picker button
          />
        </View>
      ) : (
        <View style={styles.phoneInputContainer}>
          <PhoneInput
            ref={phoneInput}
            value={phone} // Use value prop instead of defaultValue
            defaultCode="VN"
            layout="first"
            onChangeText={handlePhoneChange}
            onChangeFormattedText={(text) => {
              setFormattedValue(text);
            }}
            containerStyle={[
              styles.phoneContainer,
              {
                borderBottomColor: "#007AFF",
                borderBottomWidth: 1,
              },
            ]}
            textContainerStyle={styles.textContainer}
            codeTextStyle={styles.codeTextStyle}
            textInputStyle={styles.textInputStyle}
            countryPickerButtonStyle={styles.countryPickerButtonStyle}
          />
        </View>
      )}

      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

      <TouchableOpacity
        style={[
          styles.nextButton,
          isButtonEnabled && styles.nextButtonEnabled,
        ]}
        onPress={handleResetPassword}
        disabled={!isButtonEnabled}
      >
        <View style={styles.nextButtonText}>
          <AntDesign name="arrowright" size={24} color="white" />
        </View>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmationModal}
        onRequestClose={() => {
          setShowConfirmationModal(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalOverlay} />
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>
              Xác nhận số điện thoại (+84) {phone}
            </Text>
            <Text style={styles.modalText}>
              Số điện thoại này sẽ được sử dụng để nhận mã xác thực
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={handleCancelReset}
              >
                <Text style={styles.textStyle}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleConfirmReset}
              >
                <Text style={styles.textStyle}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default ResetPasswordScreen;