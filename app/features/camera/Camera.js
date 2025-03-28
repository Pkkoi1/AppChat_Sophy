import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";

const CameraScreen = () => {
  const cameraRef = useRef(null);
  const [cameraPermission, setCameraPermission] = useCameraPermissions(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(null);
  const [photo, setPhoto] = useState(null);

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

  const sharePicture = async () => {
    if (photo) {
      await shareAsync(photo.uri);
    }
  };

  const savePicture = async () => {
    if (photo && mediaLibraryPermission) {
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      alert("Ảnh đã được lưu vào thư viện!");
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
      </View>
    );
  }

  return (
    <CameraView style={styles.camera} ref={cameraRef}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={takePicture} style={styles.button}>
          <Text style={styles.buttonText}>Chụp ảnh</Text>
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
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    margin: 10,
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
});

export default CameraScreen;
