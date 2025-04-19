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
  pinnedButton: {
    backgroundColor: "#f0f8ff",
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007bff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pinnedButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  pinnedButtonText: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
  },
  pinnedCount: {
    backgroundColor: "#007bff",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 10,
  },
});

export default ConversationStyle;
