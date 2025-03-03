import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

const ChatFooter = () => {
  return (
    <SafeAreaView style={ChatFooterStyle.container}>
      <TouchableOpacity>
        <MaterialCommunityIcons
          name="sticker-emoji"
          size={24}
          color="#8f8f8f"
        />
      </TouchableOpacity>
      <TextInput placeholder="Nhập tin nhắn" style={ChatFooterStyle.text} />
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

      <TouchableOpacity>
        <SimpleLineIcons name="picture" size={24} color="#8f8f8f" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const ChatFooterStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 0,
    width: "100%",
    paddingVertical: 3,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
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
    fontSize: 16,
    width: "60%",
    color: "#000",
  },
  subText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default ChatFooter;
