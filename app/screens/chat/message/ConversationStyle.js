import React from "react";
import { StyleSheet } from "react-native";
import Color from "@/app/components/colors/Color";

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
  typingIndicatorContainer: {
    position: "absolute",
    bottom: -5,
    left: 10,
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: "auto",
  },
  typingIndicatorText: {
    fontSize: 14,
    fontStyle: "italic",
    color: Color.sophy,
  },
});

export default ConversationStyle;
