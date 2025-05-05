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

  // Sort images by date (newest to oldest)
  const sortedImages = images.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Group images by date
  const groupedImages = sortedImages.reduce((groups, image) => {
    const date = moment(image.createdAt).format("YYYY-MM-DD");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {});

  const groupedData = Object.entries(groupedImages).map(([date, images]) => ({
    date,
    images,
  }));

  const handleImagePress = (index) => {
    navigation.navigate("ListImageFullView", {
      images: sortedImages, // Pass the sorted list of images
      initialIndex: index, // Pass the correct index
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
            data={item.images} // No need to reverse, already sorted
            keyExtractor={(image, index) => index.toString()}
            numColumns={3}
            renderItem={({ item: image, index }) => (
              <TouchableOpacity
                style={styles.imageWrapper}
                onPress={() => handleImagePress(index)}
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
