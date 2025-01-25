// filepath: /D:/Study/CongNgheMoi/ChapApp_Sophy/components/Screens/Access/Main.js
import React, { useState, useRef } from "react";
import { useNavigation } from '@react-navigation/native';
import images from "@/assets/objects/Main_Images";
import {
  Image,
  Text,
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

const { width, height } = Dimensions.get("window");

const Main = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const onViewRef = useRef(({ changed }) => {
    if (changed[0].isViewable) {
      setCurrentIndex(changed[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View style={styles.container}>
      <Text style={styles.app_name}>Sophy</Text>

      <ImageBackground
        source={require("../../../../assets/images/bg.png")}
        style={styles.imageBanner}
        imageStyle={styles.imageBackgroundImage}
      >
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image source={item.source} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          )}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          ref={flatListRef}
        />

        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index
                  ? styles.activeIndicator
                  : styles.inactiveIndicator,
              ]}
            />
          ))}
        </View>
      </ImageBackground>
      <View>
        <TouchableOpacity
          style={[styles.buttonSign, styles.signIn_Button]}
          // onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonSign, styles.signUp_Button]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonSignUpText}>Tạo tài khoản mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)",
  },
  app_name: {
    fontSize: width * 0.1,
    marginTop: width * -0.1,
    color: "#1b6dfa",
    fontWeight: "bold",
  },
  imageBanner: {
    marginTop: width * 0.2,
    height: height * 0.5, // 50% of screen height
  },
  imageBackgroundImage: {
    opacity: 0.5, // Làm mờ hình nền
  },
  imageContainer: {
    width,
    alignItems: "center",
  },
  image: {
    width: width * 0.8,
    height: 200,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    textAlign: "center",
    marginHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: width * 0.15,
    justifyContent: "center",
    width: "100%",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "#1b6dfa",
  },
  inactiveIndicator: {
    backgroundColor: "gray",
  },
  buttonSign: {
    margin: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 50,
    width: width * 0.9,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  signIn_Button: {
    backgroundColor: "#1068fe",
  },
  signUp_Button: {
    backgroundColor: "#e9efef",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonSignUpText: {
    color: "#0d0d0d",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Main;