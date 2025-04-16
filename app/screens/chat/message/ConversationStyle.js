import React from "react";
import { StyleSheet } from "react-native";

const ConversationStyle = StyleSheet.create({
  conversationContainer: {
    flex: 1,
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
