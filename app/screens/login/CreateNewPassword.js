import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import HeadView from '../header/Header';
import Color from '@/app/components/colors/Color';
import axios from 'axios'; // Import axios
import {api} from '../../api/api'; // Assuming the API module is imported

const CreatePasswordScreen = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { phone } = route.params;

  const handleVerification = () => {
    setIsVerified(true);
  };

  const handlePasswordUpdate = async () => {
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      try {
        console.log(phone);
        console.log(newPassword);
        const response = await api.resetPassword(phone, newPassword);
        if (response.message === 'Password changed successfully') {
          Alert.alert('Thành công', 'Mật khẩu đã được cập nhật thành công!');
          navigation.navigate('Login');
          // Navigate to login screen or any other screen
        } else {
          Alert.alert('Lỗi', 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error("Lỗi cập nhật mật khẩu:", error);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật mật khẩu.');
      }
    } else {
      Alert.alert('Lỗi', 'Mật khẩu không khớp hoặc quá ngắn');
    }
  };

  return (
    <View style={styles.container}>
      {!isVerified ? (
        <View style={styles.content}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/845/845646.png' }}
            style={styles.icon}
          />
          <Text style={styles.successText}>Đăng Nhập Thành Công</Text>
          <Text style={styles.subHeader}>
            Bây giờ bạn có thể tạo lại mật khẩu mới. Tài khoản và mật khẩu này dùng để đăng nhập trên bất kỳ thiết bị nào.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleVerification}>
            <Text style={styles.primaryButtonText}>TẠO MẬT KHẨU</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.secondaryButtonText}>Để sau</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <HeadView page="CreateNewPassword" navigation={navigation} />
          <Text style={styles.subtitle}>
            Mật khẩu phải gồm chữ và số, không được chứa năm sinh, username và tên Zalo của bạn.
          </Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Mật khẩu mới:</Text>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.toggleText}>{showPassword ? 'ẨN' : 'HIỆN'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <TouchableOpacity
            style={[styles.updateButton, newPassword && confirmPassword ? styles.updateButtonEnabled : null]}
            onPress={handlePasswordUpdate}
            disabled={!newPassword || !confirmPassword}
          >
            <Text style={styles.updateButtonText}>CẬP NHẬT</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '100%',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: "#F0F4F3",
    width: '100%',
    height: 40,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 0,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    paddingHorizontal: 20,
  },
  toggleButton: {
    
    right: 15,
    top: 35,
  },
  toggleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: '#CED4DA',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '50%',
  },
  updateButtonEnabled: {
    backgroundColor: '#007AFF',
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreatePasswordScreen;