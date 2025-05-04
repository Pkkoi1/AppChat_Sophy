import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useNavigation } from "@react-navigation/native";

const groupOptions = [
  {
    name: "Lịch nhóm",
    icon: <Ionicons name="calendar-outline" size={20} color="#888c90" />,
  },
  {
    name: "Tin nhắn đã ghim",
    icon: <SimpleLineIcons name="pin" size={20} color="#888c90" />,
  },
  {
    name: "Bình chọn",
    icon: <SimpleLineIcons name="chart" size={20} color="#888c90" />,
  },
];

const GalleryOption = ({ isGroup, conversation }) => {
  const navigation = useNavigation(); // Initialize navigation

  // Combine images, GIFs, and videos
  const allMedia = [
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

  // Sort media by date (newest to oldest)
  const sortedMedia = allMedia.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get the last 4 items
  const images = sortedMedia.slice(0, 4);

  const hasImages = images && images.length > 0;

  const handleNavigateToFile = () => {
    navigation.navigate("File", { conversation }); // Navigate to File screen with conversation data
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleNavigateToFile}>
        <View style={styles.header}>
          <EvilIcons
            name="image"
            size={30}
            color="#888c90"
            style={styles.icon}
          />
          <View>
            <Text style={styles.title}>Ảnh, file, link</Text>
          </View>
        </View>
        <View style={styles.imageContainer}>
          {hasImages ? (
            images.map((image, index) => (
              <View key={index}>
                <Image source={{ uri: image.url }} style={styles.image} />
              </View>
            ))
          ) : (
            <Text style={styles.noFilesText}>Không có tệp nào</Text>
          )}
          {hasImages && (
            <View style={styles.moreArrow}>
              <AntDesign name="arrowright" size={20} color="#1b96fd" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View>
        {isGroup &&
          groupOptions.map((option, index) => (
            <TouchableOpacity style={styles.groupButton} key={index}>
              <View style={styles.buttonIcon}>{option.icon}</View>
              <View style={styles.textBorder}>
                <Text style={styles.groupText}>{option.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 0,
    marginBottom: 10,
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 5,
    marginRight: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "400",
    marginLeft: 4,
    paddingTop: 5,
  },
  button: {
    padding: 10,
    marginLeft: 9,
  },
  borderButton: {
    borderTopWidth: 0.4,
    borderTopColor: "#ddd",
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    alignContent: "center",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 45,
  },
  icon: {
    marginRight: 10,
    padding: 0,
  },
  moreArrow: {
    backgroundColor: "#e8f6ff",
    width: 55,
    height: 55,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    // marginRight: 10,
    padding: 0,
    paddingTop: 15,
  },
  textBorder: {
    borderTopWidth: 0.4,
    borderTopColor: "#ddd",
    paddingTop: 16,
    width: "88%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: -10,
  },
  groupText: {
    color: "#000",
    fontSize: 15,
  },
  groupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 24,
    paddingBottom: 18,
  },
  noFilesText: {
    fontSize: 15,
    color: "#888c90",
    marginLeft: 45,
    marginTop: 10,
  },
});

export default GalleryOption;
