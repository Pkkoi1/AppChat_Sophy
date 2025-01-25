import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
// import styles from './styles/Login.style'; // Import styles từ file riêng

function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    Alert.alert('Đăng nhập thành công!', `Số điện thoại: ${phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Subtitle sát header */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
        </Text>
      </View>

      {/* Input fields */}
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Mật khẩu"
          secureTextEntry={secureTextEntry}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setSecureTextEntry(!secureTextEntry)}
        >
          <Text style={styles.showText}>
            {secureTextEntry ? 'HIỆN' : 'ẨN'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Forgot password */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Lấy lại mật khẩu</Text>
      </TouchableOpacity>

      {/* FAQ link */}
      <TouchableOpacity
        style={styles.faqLinkContainer}
        onPress={() => Alert.alert('Câu hỏi thường gặp')}
      >
        <Text style={styles.faqLink}>Câu hỏi thường gặp ›</Text>
      </TouchableOpacity>

      {/* Next button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleLogin}>
        <Text style={styles.nextButtonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subtitleContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  showText: {
    padding: 10,
    color: 'blue',
  },
  forgotPassword: {
    color: 'blue',
    marginBottom: 10,
  },
  faqLinkContainer: {
    marginTop: 10,
  },
  faqLink: {
    color: 'blue',
  },
  nextButton: {
    width: 40,
    height: 40,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 10,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default LoginScreen;
