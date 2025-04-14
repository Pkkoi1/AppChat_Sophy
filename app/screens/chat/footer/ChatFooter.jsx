import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

const ChatFooter = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const textInputRef = useRef(null); // Ref for TextInput

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ type: "text", content: message });
      setMessage("");
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
    <SafeAreaView style={ChatFooterStyle.container}>
      <TouchableOpacity>
        <MaterialCommunityIcons
          name="sticker-emoji"
          size={24}
          color="#8f8f8f"
        />
      </TouchableOpacity>
      <TextInput
        ref={textInputRef} // Attach ref to TextInput
        placeholder="Nhập tin nhắn"
        style={ChatFooterStyle.text}
        value={message}
        onChangeText={setMessage}
        onFocus={() => console.log("TextInput focused", Date.now())} // Debug focus behavior
        onBlur={() => console.log("TextInput blurred", Date.now())} // Debug blur behavior
        keyboardShouldPersistTaps="handled" // Ensure keyboard stays open
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
    </SafeAreaView>
  );
};

const ChatFooterStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    margin: 0,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginBottom: 0, // Remove extra margin
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingHorizontal: 10,
  },
  sendButton: {
    paddingHorizontal: 10,
  },
});

export default ChatFooter;
