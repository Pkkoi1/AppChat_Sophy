import React from "react";
import { StyleSheet } from "react-native";

const ConversationStyle = StyleSheet.create({
  conversationContainer: {
    flex: 1, // Ensure the container takes up available space
    // marginBottom: 60, // Add space for the footer
    position: "relative", // Allow absolute positioning of child elements
  },
  timestampContainer: {
    backgroundColor: "#d3d3d3",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    alignSelf: "center",
    marginVertical: 10,
  },
  timestampText: {
    color: "white",
    fontSize: 12,
  },
});

export default ConversationStyle;
