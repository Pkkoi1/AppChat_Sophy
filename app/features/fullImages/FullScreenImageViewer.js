import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  Alert,
} from "react-native";
import CameraRoll from "@react-native-camera-roll/camera-roll"; // Import CameraRoll for saving images
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions"; // Import permissions API
import AvatarUser from "@/app/components/profile/AvatarUser"; // Import AvatarUser for fallback

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const FullScreenImageViewer = ({ route, navigation }) => {
  const { imageUrl, fallbackText } = route.params; // Get the image URL and fallback text from navigation params
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleImageLoad = (event) => {
    const { width, height } = event.nativeEvent.source;

    // Tính toán kích thước phù hợp với màn hình
    const aspectRatio = width / height;
    let adjustedWidth = screenWidth;
    let adjustedHeight = screenWidth / aspectRatio;

    if (adjustedHeight > screenHeight) {
      adjustedHeight = screenHeight;
      adjustedWidth = screenHeight * aspectRatio;
    }

    setImageSize({ width: adjustedWidth, height: adjustedHeight });
  };

  const saveImageToDevice = async () => {
    if (!imageUrl) {
      Alert.alert("Lỗi", "Không có hình ảnh để lưu.");
      return;
    }

    try {
      const permission =
        Platform.OS === "android"
          ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
          : PERMISSIONS.IOS.PHOTO_LIBRARY;

      const result = await check(permission);

      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult !== RESULTS.GRANTED) {
          Alert.alert("Quyền bị từ chối", "Không thể lưu hình ảnh.");
          return;
        }
      } else if (result !== RESULTS.GRANTED) {
        Alert.alert("Quyền bị từ chối", "Không thể lưu hình ảnh.");
        return;
      }

      await CameraRoll.save(imageUrl, { type: "photo" });
      Alert.alert("Thành công", "Hình ảnh đã được lưu vào thư viện.");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Lỗi", "Không thể lưu hình ảnh.");
    }
  };

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: imageSize.width,
              height: imageSize.height,
            },
          ]}
          onLoad={handleImageLoad}
        />
      ) : (
        <AvatarUser
          fullName={fallbackText}
          width={200}
          height={200}
          avtText={60}
          shadow={true}
          bordered={true}
        />
      )}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeText}>Đóng</Text>
      </TouchableOpacity>
      {imageUrl && (
        <TouchableOpacity style={styles.saveButton} onPress={saveImageToDevice}>
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 20,
  },
  closeText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 20,
  },
  saveText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FullScreenImageViewer;
