import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import AntDesign from "@expo/vector-icons/AntDesign"; // Import AntDesign for the arrow icon

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ListImageFullView = ({ route }) => {
  const { images, initialIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const navigation = useNavigation();

  const handleImagePress = (index) => {
    setCurrentIndex(index);
  };

  const saveImageToDevice = async () => {
    const imageUrl = images[currentIndex]?.url;
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
      <Image
        source={{ uri: images[currentIndex]?.url }}
        style={styles.fullImage}
        resizeMode="contain"
      />
      <View style={styles.thumbnailContainer}>
        <FlatList
          data={images}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.thumbnailWrapper,
                currentIndex === index && styles.activeThumbnail,
              ]}
              onPress={() => handleImagePress(index)}
            >
              <Image source={{ uri: item.url }} style={styles.thumbnail} />
            </TouchableOpacity>
          )}
        />
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={20} color="black" />
        {/* Arrow icon */}
        <Text style={styles.closeText}>Đóng</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={saveImageToDevice}>
        <Text style={styles.saveText}>Lưu</Text>
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
  fullImage: {
    width: screenWidth,
    height: screenHeight,
  },
  thumbnailContainer: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    paddingHorizontal: 10,
  },
  thumbnailWrapper: {
    margin: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#1f7bff",
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 5,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    flexDirection: "row", // Align arrow and text horizontally
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 20,
  },
  closeText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5, // Add spacing between the arrow and text
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

export default ListImageFullView;
