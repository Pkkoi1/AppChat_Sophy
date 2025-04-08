import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions, Camera } from "expo-camera";
import { shareAsync } from "expo-sharing";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as MediaLibrary from "expo-media-library";
import { useMediaLibraryPermissions } from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "expo-router";

const CameraScreen = ({ navigation }) => {
  const cameraRef = useRef(null);
  const [cameraPermission, setCameraPermission] = useCameraPermissions(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] =
    useMediaLibraryPermissions(null);
  const [photo, setPhoto] = useState(null);
  const [facing, setFacing] = useState("back");

  const toggleCameraFacing = () => {
    setFacing(facing === "back" ? "front" : "back");
  };

  const toggleExit = () => {
    navigation.goBack();
    console.log("Exit camera");
  };
  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();

      setCameraPermission(cameraStatus.status === "granted");
      setMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    })();
  }, []);

  if (cameraPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  if (cameraPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Không có quyền truy cập camera</Text>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true, skipProcessing: true };
      const newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
    }
  };
  const usePicture = () => {
    if (photo) {
      console.log(photo.uri);
      navigation.navigate("Edit", { photoUri: photo.uri }); // Truyền URI ảnh về Edit
    }
  };

  const sharePicture = async () => {
    if (photo) {
      await shareAsync(photo.uri);
    }
  };

  const savePicture = async () => {
    if (photo && mediaLibraryPermission) {
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      alert("Ảnh đã được lưu vào thư viện!");
    } else {
      alert("Không có quyền truy cập vào thư viện ảnh!");
      console.log("Media library permission not granted.");
      console.log(mediaLibraryPermission);
      // console.log(photo);
    }
  };

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo.uri }} style={styles.preview} />
        <TouchableOpacity onPress={sharePicture} style={styles.button}>
          <Text style={styles.buttonText}>Chia sẻ ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={savePicture} style={styles.button}>
          <Text style={styles.buttonText}>Lưu ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPhoto(null)} style={styles.button}>
          <Text style={styles.buttonText}>Chụp lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={usePicture} style={styles.button}>
          <Text style={styles.buttonText}>Sử dụng ảnh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={takePicture}
          style={styles.takePictureButton}
        >
          <View style={styles.circleButton}></View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleCameraFacing}
          style={styles.flipButtonContainer}
        >
          <MaterialIcons
            style={styles.flipButton}
            name="flip-camera-android"
            size={30}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleExit} style={styles.exitButton}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </CameraView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  flipButtonContainer: {
    backgroundColor: "none",
    padding: 10,
    borderRadius: 5,
    margin: 10,
    width: 65,
    height: 65,
    position: "absolute",
    right: 5,
    top: 30,
  },
  takePictureButton: {
    backgroundColor: "none",
    padding: 20,
    borderRadius: 50,
    margin: 10,
    width: 65,
    height: 65,
    borderColor: "#fff",
    borderWidth: 3,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
  },
  circleButton: {
    borderRadius: 50,
    backgroundColor: "#fff",
    // marginRight: 10,
    width: 48,
    height: 48,
  },
  flipButton: {
    backgroundColor: "none",
  },
  buttonText: {
    fontSize: 18,
    color: "#000",
  },
  preview: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },

  exitButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "none",
    borderRadius: 5,
    padding: 10,
  },
});

export default CameraScreen;
