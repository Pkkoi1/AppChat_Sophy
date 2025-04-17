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

const ChatFooter = ({
  onSendMessage,
  onSendImage,
  onSendFile,
  socket,
  conversation,
  setIsTyping,
  isTyping, // Add isTyping prop
}) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const userTypingTimeoutRef = useRef(null); // Ref to manage userTyping timeout
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    if (socket && conversation?.conversationId) {
      socket.on("userTyping", ({ conversationId, userId, fullname }) => {
        if (conversationId !== conversation.conversationId) return;

        setIsTyping(true); // Update typing state
        console.log(`Người dùng ${fullname} đang nhập...`, conversationId);

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
  }, [socket, conversation, setIsTyping]);

  const handleTyping = () => {
    if (socket && conversation?.conversationId) {
      socket.emit("typing", {
        conversationId: conversation.conversationId,
        userId: socket.userId,
        fullname: userInfo.fullname,
      });
      setIsTyping(true);

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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
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
          "Ứng dụng cần quyền truy cập thư viện phương tiện."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Cho phép chọn cả ảnh và video
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedMedia = result.assets[0];
        if (selectedMedia.type === "video") {
          onSendImage({ type: "video", attachment: selectedMedia.uri });
        } else if (selectedMedia.type === "image") {
          onSendImage({ type: "image", attachment: selectedMedia.uri });
        }
      } else {
        console.log(
          "Người dùng đã hủy chọn phương tiện hoặc không có phương tiện hợp lệ."
        );
      }
    } catch (error) {
      console.error("Lỗi khi chọn phương tiện từ thư viện:", error);
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
