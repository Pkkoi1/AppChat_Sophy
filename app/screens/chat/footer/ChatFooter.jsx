import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import * as DocumentPicker from "expo-document-picker";

import AntDesign from "@expo/vector-icons/AntDesign";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

const ChatFooter = ({ onSendMessage, onSendImage, onSendFile }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ type: "text", content: message });
      setMessage(""); // Clear the input field
    }
  };

  const pickDocument = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Ứng dụng cần quyền truy cập thư viện tệp."
        );
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allow all file types
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0]; // Get the first file
        console.log("Đã chọn file:", selectedFile);
        onSendFile?.({
          type: "file",
          attachment: selectedFile.uri,
          fileName: selectedFile.name,
          mimeType: selectedFile.mimeType,
        });
      } else {
        console.log("Người dùng đã hủy chọn file hoặc không có file hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi khi chọn file từ thư viện:", error);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Ứng dụng cần quyền truy cập thư viện ảnh."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        onSendImage({ type: "image", attachment: selectedImageUri });
      } else {
        console.log("Người dùng đã hủy chọn ảnh hoặc không có ảnh hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh từ thư viện:", error);
    }
  };

  return (
    <View style={ChatFooterStyle.container}>
      <TouchableOpacity>
        <MaterialCommunityIcons
          name="sticker-emoji"
          size={24}
          color="#8f8f8f"
        />
      </TouchableOpacity>
      <TextInput
        placeholder="Nhập tin nhắn"
        style={ChatFooterStyle.text}
        value={message}
        onChangeText={(text) => {
          setMessage(text);
        }}
      />
      {message.trim() ? (
        <TouchableOpacity
          onPress={handleSend}
          style={ChatFooterStyle.sendButton}
        >
          <Ionicons name="send" size={24} color="#005ae0" />
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity onPress={pickDocument}>
            <AntDesign name="addfile" size={24} color="#8f8f8f" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Feather name="mic" size={24} color="#8f8f8f" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <SimpleLineIcons name="picture" size={24} color="#8f8f8f" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const ChatFooterStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  sendButton: {
    paddingHorizontal: 10,
  },
});

export default React.memo(ChatFooter);
