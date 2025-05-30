import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {api} from '../../api/api'; // Assuming the API module is imported
import HeadView from '../header/Header';

const { width } = Dimensions.get('window');

const VerificationScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleVerification = async () => {
    if (code.every(digit => digit !== '')) {
      const verificationCode = code.join('');
      console.log('Verification code:', verificationCode);
      console.log('Phone number:', phone);
      try {
        const response = await api.verifyOTPForgotPassword(phone, verificationCode, route.params.otpId);
        if (response.message === 'Phone verified successfully') {
          navigation.navigate('CreateNewPassword', { phone: phone });
        } else {
          Alert.alert('Lỗi', 'Mã xác thực không đúng');
        }
      } catch (error) {
        console.error("Lỗi xác minh OTP:", error);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác minh OTP');
      }
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ 6 chữ số');
    }
  };

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeadView page="VerificationCode" navigation={navigation} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Vui lòng không chia sẻ mã xác thực để tránh mất tài khoản.
        </Text>

        {/* Phone Number */}
        <View style={styles.phoneContainer}>
          <Icon name="call-outline" size={50} color="#1b96fd" />
          <Text style={styles.phone}>
            (+84) {phone}
          </Text>
          <Text style={styles.instruction}>
            Soạn tin nhắn nhận mã xác thực và điền vào bên dưới
          </Text>
        </View>

        {/* Input */}
        <View style={styles.codeInputContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              ref={(ref) => (inputRefs.current[index] = ref)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                  inputRefs.current[index - 1]?.focus();
                }
              }}
            />
          ))}
        </View>

        {/* Resend Code */}
        <TouchableOpacity style={styles.resendContainer} onPress={() => Alert.alert('Gửi lại mã')}>
          <Text style={styles.resendText}>Bạn chưa nhận được mã? <Text style={{ fontWeight: 'bold' }}>Gửi lại mã</Text></Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, code.every(digit => digit !== '') ? styles.buttonEnabled : styles.buttonDisabled]}
          onPress={handleVerification}
          disabled={!code.every(digit => digit !== '')}
        >
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b96fd',
    height: 60,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',

  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: "#F0F4F3",
    width: '100%',
    height: 30,
    padding: 5,

  },
  phoneContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  phone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  instruction: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 5,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    padding: 20,
  },
  codeInput: {
    width: width * 0.12,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
  },
  resendContainer: {
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: 'blue',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#1b96fd',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VerificationScreen;