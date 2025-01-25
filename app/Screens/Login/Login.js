import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import styles from '@/components/LoginStyle/Login.style';

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
      {/* Subtitle */}
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



export default LoginScreen;
