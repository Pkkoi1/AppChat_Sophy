import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment"; // Import moment for date formatting

const ImageTab = ({ conversation }) => {
  const navigation = useNavigation();

  // Combine images, GIFs, and videos
  const images = [
    ...(conversation?.listImage || []),
    ...(
      conversation?.listFile?.filter((file) => {
        const isImageOrGif = file.name?.match(/\.(gif|png|jpe?g)$/i);
        const isVideo = file.name?.match(/\.(mp4|mov|avi|mkv)$/i);
        return isImageOrGif || isVideo;
      }) || []
    ).map((file) => ({
      url: file.downloadUrl,
      createdAt: file.createdAt,
    })),
  ];

  if (images.length === 0) {
    return <Text style={styles.noDataText}>Không có hình ảnh</Text>;
  }

  // Group images by date (YYYY-MM-DD)
  const groupedImages = images.reduce((groups, image) => {
    const date = moment(image.createdAt).format("YYYY-MM-DD");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {});

  // Tạo mảng các nhóm, mỗi nhóm gồm ngày và danh sách ảnh đã được sort đúng thứ tự mới nhất lên đầu
  const groupedData = Object.entries(groupedImages)
    .map(([date, imgs]) => ({
      date,
      images: imgs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Tạo mảng ảnh đã sort toàn cục để truyền vào full view
  const allSortedImages = images
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleImagePress = (image) => {
    // Tìm index của ảnh trong mảng đã sort toàn cục
    const index = allSortedImages.findIndex(
      (img) => img.url === image.url && img.createdAt === image.createdAt
    );
    navigation.navigate("ListImageFullView", {
      images: allSortedImages,
      initialIndex: index,
    });
  };

  return (
    <FlatList
      data={groupedData}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {moment(item.date).format("DD/MM/YYYY")}
          </Text>
          <FlatList
            data={item.images}
            keyExtractor={(image, index) => index.toString()}
            numColumns={3}
            renderItem={({ item: image }) => (
              <TouchableOpacity
                style={styles.imageWrapper}
                onPress={() => handleImagePress(image)}
              >
                <Image source={{ uri: image.url }} style={styles.image} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#888c90",
    textAlign: "center",
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  imageWrapper: {
    margin: 5,
  },
  image: {
    width: 100,
    height: 100,
  },
});

export default ImageTab;
