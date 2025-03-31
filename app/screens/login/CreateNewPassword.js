import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';

const CreatePasswordScreen = () => {
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleVerification = () => {
      setIsVerified(true); // Chuyển sang màn hình tạo mật khẩu sau khi xác thực thành công
  };

  const handlePasswordUpdate = () => {
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      Alert.alert('Mật khẩu đã được cập nhật thành công!');
    } else {
      Alert.alert('Mật khẩu không khớp hoặc quá ngắn');
    }
  };

  return (
    <View style={styles.container}>
      {!isVerified ? (
        // Màn hình nhập mã xác thực
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
        // Màn hình tạo mật khẩu mới
        <View style={styles.content}>
          <Text style={styles.subHeader}>
            Bây giờ bạn có thể tạo lại mật khẩu mới. Tài khoản và mật khẩu này dùng để đăng nhập trên bất kỳ thiết bị nào.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordUpdate}>
            <Text style={styles.primaryButtonText}>CẬP NHẬT</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 20,
        justifyContent: 'flex-start', // Đưa container lên phía trên
      },
      content: {
        flex: 1,
        alignItems: 'center',
      },
      header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 20,
      },
      subHeader: {
        fontSize: 14,
        color: '#6C757D',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
      },
      icon: {
        width: 80,
        height: 80,
        marginBottom: 20,
      },
      successText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
      },
      input: {
        width: '100%',
        height: 50,
        borderColor: '#CED4DA',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#FFF',
      },
      primaryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
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
});

export default CreatePasswordScreen;