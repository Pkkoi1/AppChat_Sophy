import React, { useState, useRef, useEffect } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

const ChatFooter = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  // const textInputRef = useRef(null);

  const handleFocus = () => {
    console.log("TextInput được focus");
    // textInputRef.current?.focus();
  };

  const handleBlur = () => {
    console.log("TextInput bị blur");
    // Không gọi focus() hay setTimeout, để bàn phím tự nhiên giữ mở

    // textInputRef.current?.focus(); // Không cần gọi focus() ở đây
    // setTimeout(() => {
    //   textInputRef.current?.focus(); // Không cần gọi focus() ở đây
    // }, 0); // Không cần gọi focus() ở đây
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ type: "text", content: message });
      setMessage(""); // Xóa nội dung ngay lập tức
      // Không gọi focus() hay setTimeout, để bàn phím tự nhiên giữ mở
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      onSendMessage({ type: "image", content: result.uri });
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
        onChangeText={setMessage}
        onFocus={handleFocus}
        onBlur={handleBlur} // Ghi lại sự kiện blur
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
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal-outline"
              size={24}
              color="#8f8f8f"
            />
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
