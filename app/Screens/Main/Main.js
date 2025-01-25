// filepath: /D:/Study/CongNgheMoi/ChapApp_Sophy/components/Screens/Access/Main.js
import React, { useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import images from "@/assets/objects/Main_Images";
import contaier from "@/components/Container/ContainerStyle";
import submitButton from "@/components/Button/ButtonStyle";
import MainStyle from "@/components/Main/MainStyle";
import BackgroundStyles from "@/components/Background/BackgroundStyles";

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
    <View style={contaier.main}>
      <Text style={MainStyle({ width }).app_name}>Sophy</Text>
      <ImageBackground
        source={require("../../../assets/images/bg.png")}
        style={MainStyle({ height }).imageBanner}
        imageStyle={BackgroundStyles().blurred}
      >
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={MainStyle({ width }).imageContainer}>
              <Image source={item.source} style={MainStyle({width}).image} />
              <View style={MainStyle({width}).textContainer}>
                <Text style={MainStyle({width}).title}>{item.title}</Text>
                <Text style={MainStyle({width}).description}>{item.description}</Text>
              </View>
            </View>
          )}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          ref={flatListRef}
        />

        <View style={MainStyle({width}).indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                MainStyle({width}).indicator,
                currentIndex === index
                  ? MainStyle({width}).activeIndicator
                  : MainStyle({width}).inactiveIndicator,
              ]}
            />
          ))}
        </View>
      </ImageBackground>
      <View style={MainStyle({width}).buttonContainer}>
        <TouchableOpacity
          style={[submitButton().submit, MainStyle({width}).signIn_Button]}
          // onPress={() => navigation.navigate('Login')}
        >
          <Text style={MainStyle({width}).buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[submitButton().submit, MainStyle({width}).signUp_Button]}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={MainStyle({width}).buttonSignUpText}>Tạo tài khoản mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
 
  imageContainer: {
    width: width,
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
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },
});

export default Main;
