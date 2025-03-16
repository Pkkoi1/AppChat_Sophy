import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

const images = [
  require("../../../../assets/images/hinh1.jpg"),
  require("../../../../assets/images/hinh2.jpg"),
  require("../../../../assets/images/hinh3.jpg"),
  require("../../../../assets/images/hinh4.jpg"),
];

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

const GalleryOption = ({ isGroup }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button}>
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
          {images.map((image, index) => (
            <View key={index}>
              <Image source={image} style={styles.image} />
            </View>
          ))}
          <View style={styles.moreArrow}>
            <AntDesign name="arrowright" size={20} color="#1b96fd" />
          </View>
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
});

export default GalleryOption;
