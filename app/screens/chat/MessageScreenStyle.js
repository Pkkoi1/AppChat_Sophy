import React from "react";
import { Platform, StyleSheet } from "react-native";

const MessageScreenStyle = StyleSheet.create({
  conversationContainer: {
    flex: 1,
    paddingBottom: 50,
    backgroundColor: "transparent", // Đảm bảo Conversation không bị che bởi Footer
  },
  chatFooter: {
    backgroundColor: "transparent",
    paddingBottom: Platform.OS === "ios" ? 10 : 0, // Đảm bảo Footer không bị che
  },
});

export default MessageScreenStyle;
