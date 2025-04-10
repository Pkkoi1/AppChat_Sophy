import { AuthContext } from "@/app/auth/AuthContext";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "@/app/api/api";
import * as FileSystem from "expo-file-system";

const MyProfileSetting = ({ navigation }) => {
  const { userInfo, updateUserInfo } = useContext(AuthContext);
  const [isLoading, setIsLoading] = React.useState(false); // Loading state

  const options = [
    {
      id: 1,
      title: "Thông tin",
      screen: "Infomation",
    },
    {
      id: 2,
      title: "Đổi ảnh đại diện",
      screen: null,
    },
    {
      id: 3,
      title: "Đổi ảnh bìa",
      screen: null,
    },
    {
      id: 4,
      title: "Cập nhật giới thiệu bản thân",
      screen: "updateIntro",
    },
  ];

  const handleOptionPress = async (screen, optionId) => {
    if (optionId === 2) {
      handleChangeAvatar();
    } else if (screen) {
      navigation.navigate(screen);
    } else {
      alert("Chức năng này chưa được hỗ trợ.");
    }
  };

  const handleChangeAvatar = async () => {
    Alert.alert(
      "Chọn ảnh đại diện",
      "Bạn muốn thực hiện hành động nào?",
      [
        {
          text: "Chụp hình",
          onPress: () => openCamera(),
        },
        {
          text: "Chọn từ thư viện",
          onPress: () => openImageLibrary(),
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
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
      await uploadImage(result.assets[0].uri);
    }
  };

  const openImageLibrary = async () => {
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
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setIsLoading(true); // Start loading
    try {
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imageBase64 = `data:image/jpeg;base64,${base64Image}`;
      const response = await api.uploadImage(imageBase64);

      if (response?.user?.urlavatar) {
        updateUserInfo({ ...userInfo, urlavatar: response.user.urlavatar });
        Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật.");
        // navigation.goBack(); // Navigate back after success
      } else {
        throw new Error("Không thể cập nhật ảnh đại diện.");
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error.message);
      Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <OptionHeader title={userInfo?.fullname || "Người dùng"} />
      {isLoading ? ( // Show loading indicator while uploading
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <FlatList
          data={options}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress(item.screen, item.id)}
            >
              <Text style={styles.optionText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  optionItem: {
    marginHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 0.4,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default MyProfileSetting;
