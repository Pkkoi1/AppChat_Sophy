import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";
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
});

export default FullScreenImageViewer;
