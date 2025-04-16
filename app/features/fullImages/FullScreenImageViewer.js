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
import * as DocumentPicker from "expo-document-picker";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
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

  const handlePinch = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      scale.value = withTiming(event.nativeEvent.scale, { duration: 200 });
    } else if (event.nativeEvent.state === State.END) {
      scale.value = withTiming(1, { duration: 200 }); // Reset scale after pinch ends
    }
  };

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

      const folderResult = await DocumentPicker.getDocumentAsync({
        type: "application/*",
        copyToCacheDirectory: false,
      });

      if (folderResult.type === "cancel") {
        Alert.alert("Hủy", "Không có thư mục nào được chọn.");
        return;
      }

      const fileUri = `${folderResult.uri}/downloaded.jpg`;
      const downloaded = await FileSystem.downloadAsync(imageUrl, fileUri);

      Alert.alert(
        "Thành công",
        `Hình ảnh đã được lưu vào: ${folderResult.uri}`
      );
    } catch (error) {
      console.error("Lỗi khi lưu ảnh:", error);
      Alert.alert("Lỗi", "Không thể lưu hình ảnh.");
    }
  };

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <PinchGestureHandler onGestureEvent={handlePinch}>
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
        </PinchGestureHandler>
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
