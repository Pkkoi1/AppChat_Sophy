import React from "react";
import { Platform, StyleSheet } from "react-native";

const MessageScreenStyle = StyleSheet.create({
  conversationContainer: {
    flex: 1,
    // paddingBottom: 100,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 15,
    color: "gray",
  },
});

export default MessageScreenStyle;
