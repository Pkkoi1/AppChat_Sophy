import React from "react";
import { Platform, StyleSheet } from "react-native";

const MessageScreenStyle = StyleSheet.create({
  conversationContainer: {
    flex: 1,
    paddingBottom: 100,
    backgroundColor: "transparent", 
  },
  chatFooter: {
    backgroundColor: "transparent",
    paddingBottom: Platform.OS === "ios" ? 10 : 0, // Đảm bảo Footer không bị che
  },
});

export default MessageScreenStyle;
