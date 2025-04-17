import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import * as DocumentPicker from "expo-document-picker";

import AntDesign from "@expo/vector-icons/AntDesign";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Color from "@/app/components/colors/Color";
import { AuthContext } from "@/app/auth/AuthContext";
import * as FileSystem from "expo-file-system";
import { CLOUDINARY_PRESET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_URL } from "@env";

const ChatFooter = ({
  onSendMessage,
  onSendImage,
  onSendFile,
  onSendVideo,
  socket,
  conversation,
  setIsTyping,
}) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const userTypingTimeoutRef = useRef(null); // Ref to manage userTyping timeout
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    if (socket && conversation?.conversationId) {
      socket.on("userTyping", ({ conversationId, userId, fullname }) => {
        if (
          userId &&
          userId !== userInfo.userId &&
          userId !== undefined &&
          userId !== "undefined"
        ) {
          setIsTyping(true); // Update typing state
          console.log(
            `Người dùng ${fullname} và ${userInfo.userId} đang nhập...`,
            conversationId
          );
        }

        // Clear the previous timeout and set a new one
        if (userTypingTimeoutRef.current) {
          clearTimeout(userTypingTimeoutRef.current);
        }
        userTypingTimeoutRef.current = setTimeout(() => {
          setIsTyping(null); // Reset typing state after 2 seconds of inactivity
        }, 1000);
      });

      return () => {
        socket.off("userTyping");
        if (userTypingTimeoutRef.current) {
          clearTimeout(userTypingTimeoutRef.current); // Clean up timeout
        }
      };
    }
  }, [socket, conversation, setIsTyping, userInfo.userId]);

  const handleTyping = () => {
    if (socket && conversation?.conversationId) {
      socket.emit("typing", {
        conversationId: conversation.conversationId,
        userId: socket.userId,
        fullname: userInfo.fullname,
      });
      // se

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false); // Turn off typing indicator after 1 second of inactivity
      }, 1000);
    }
  };

  const handleInputChange = (text) => {
    setMessage(text);
    handleTyping();
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ type: "text", content: message });
      setMessage("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);
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
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedFile = result.assets[0];
        console.log("Đã chọn file:", selectedFile);

        const mime = selectedFile.mimeType || "";

        if (mime.startsWith("video")) {
          try {
            const attachment = await uploadVideoToCloudinary(selectedFile);
            onSendVideo?.({
              ...attachment,
            });
          } catch (error) {
            Alert.alert("Lỗi", "Không thể tải video lên. Vui lòng thử lại.");
          }
        } else {
          if (selectedFile.size > 10485760) {
            Alert.alert(
              "Kích thước tệp quá lớn",
              "Vui lòng chọn tệp nhỏ hơn 10MB."
            );
            return;
          }
          onSendFile?.({
            type: "file",
            attachment: selectedFile.uri,
            fileName: selectedFile.name,
            mimeType: mime,
          });
        }
      } else {
        console.log("Người dùng hủy hoặc không có file.");
      }
    } catch (error) {
      console.error("Lỗi chọn file:", error);
    }
  };

  const uploadFileToCloudinary = async (selectedFile) => {
    try {
      // Read file and convert to Base64
      const base64File = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileBase64 = `data:${selectedFile.mimeType};base64,${base64File}`;

      // Create payload for Cloudinary
      const data = new FormData();
      data.append("file", fileBase64);
      data.append("upload_preset", CLOUDINARY_PRESET);
      data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Lỗi khi upload file lên Cloudinary:", result);
        throw new Error(result.error?.message || "Upload file thất bại.");
      }

      console.log("Đã upload file lên Cloudinary:", result);

      // Construct the attachment object
      const attachment = {
        type: "file",
        url: result.secure_url,
        downloadUrl: result.secure_url.replace(
          "/upload/",
          "/upload/fl_attachment/"
        ),
        size: result.bytes,
        name: selectedFile.name,
      };

      return attachment;
    } catch (error) {
      console.error("Lỗi khi upload file lên Cloudinary:", error);
      throw error;
    }
  };
  //Xử lý video
  const uploadVideoToCloudinary = async (selectedMedia) => {
    try {
      // Đọc file video và chuyển đổi sang Base64
      const base64File = await FileSystem.readAsStringAsync(selectedMedia.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileBase64 = `data:${
        selectedMedia.type || "video/mp4"
      };base64,${base64File}`;

      // Tạo payload để gửi lên Cloudinary
      const data = new FormData();
      data.append("file", fileBase64); // Gửi Base64 thay vì URI
      data.append("upload_preset", CLOUDINARY_PRESET); // Replace with your preset
      data.append("cloud_name", CLOUDINARY_CLOUD_NAME); // Replace with your cloud name

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Lỗi khi upload video lên Cloudinary:", result);
        throw new Error(result.error?.message || "Upload video thất bại.");
      }

      console.log("Đã upload video lên Cloudinary:", result);

      // Construct the attachment object
      const attachment = {
        type: "video",
        url: result.secure_url,
        downloadUrl: result.secure_url.replace(
          "/upload/",
          "/upload/fl_attachment/"
        ),
        size: result.bytes,
        name: selectedMedia.name,
      };

      return attachment;
    } catch (error) {
      console.error("Lỗi khi upload video lên Cloudinary:", error);
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Ứng dụng cần quyền truy cập thư viện phương tiện."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedMedia = result.assets[0];
        if (selectedMedia.type === "video") {
          try {
            const attachment = await uploadVideoToCloudinary(selectedMedia);
            onSendVideo({ ...attachment });
          } catch (error) {
            Alert.alert("Lỗi", "Không thể tải video lên. Vui lòng thử lại.");
          }
        } else if (selectedMedia.type === "image") {
          onSendImage({ type: "image", attachment: selectedMedia.uri });
        }
      } else {
        console.log("Người dùng hủy hoặc không chọn gì.");
      }
    } catch (error) {
      console.error("Lỗi chọn phương tiện:", error);
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
        onChangeText={handleInputChange}
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
