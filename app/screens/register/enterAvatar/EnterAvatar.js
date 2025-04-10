import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "@/app/auth/AuthContext";
import AvatarUser from "@/app/components/profile/AvatarUser";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { api } from "@/app/api/api";

const EnterAvatar = ({ navigation }) => {
  const { userInfo, updateUserInfo } = useContext(AuthContext);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectFromLibrary = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Quyền truy cập bị từ chối",
        "Ứng dụng cần quyền truy cập thư viện ảnh."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedAvatar(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Quyền truy cập bị từ chối",
        "Ứng dụng cần quyền truy cập camera."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedAvatar(result.assets[0].uri);
    }
  };

  const handleSkip = () => {
    navigation.navigate("Home");
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      Alert.alert("Lỗi", "Vui lòng chọn ảnh trước khi lưu.");
      return;
    }

    setIsLoading(true);
    try {
      const base64Image = await FileSystem.readAsStringAsync(selectedAvatar, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imageBase64 = `data:image/jpeg;base64,${base64Image}`;
      const response = await api.uploadImage(imageBase64);

      const updatedAvatar = response.user.urlavatar;
      updateUserInfo({ ...userInfo, urlavatar: updatedAvatar });

      Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật.");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Lỗi khi lưu ảnh đại diện:", error.message);
      Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật ảnh đại diện</Text>
      <Text style={styles.subtitle}>
        Đặt ảnh đại diện để mọi người dễ nhận ra bạn
      </Text>
      <View style={styles.avatarContainer}>
        {selectedAvatar ? (
          <Image source={{ uri: selectedAvatar }} style={styles.avatar} />
        ) : (
          <AvatarUser
            fullName={userInfo?.fullname}
            width={200}
            height={200}
            avtText={80}
            shadow={false}
            bordered={false}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSelectFromLibrary}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Chọn ảnh từ thư viện</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleTakePhoto}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Chụp ảnh mới</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSaveAvatar}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Lưu</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Bỏ qua</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 200,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 10,
  },
  skipButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});

export default EnterAvatar;
