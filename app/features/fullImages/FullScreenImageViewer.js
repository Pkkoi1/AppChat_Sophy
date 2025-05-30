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
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import AvatarUser from "@/app/components/profile/AvatarUser";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const FullScreenImageViewer = ({ route, navigation }) => {
  const { imageUrl, fallbackText } = route.params;
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleImageLoad = (event) => {
    const { width, height } = event.nativeEvent.source;

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
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Không thể lưu hình ảnh.");
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}downloaded.jpg`;
      await FileSystem.downloadAsync(imageUrl, fileUri);

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert("Thành công", "Hình ảnh đã được lưu vào thư viện.");
    } catch (error) {
      console.error("Lỗi khi lưu ảnh:", error);
      Alert.alert("Lỗi", "Không thể lưu hình ảnh.");
    }
  };

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Animated.Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            animatedStyle,
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
