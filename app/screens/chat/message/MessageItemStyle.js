import React from "react";
import { StyleSheet } from "react-native";

const MessageItemStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 5,
  },
  senderContainer: {
    justifyContent: "flex-end",
  },
  receiverContainer: {
    justifyContent: "flex-start",
  },
  messageBox: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  sender: {
    backgroundColor: "#d4f1ff",
    alignSelf: "flex-end",
    marginRight: 10, // Add margin to the right for sender
  },
  receiver: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    marginLeft: 10, // Add margin to the left for receiver
  },
  receiverWithAvatar: {
    marginLeft: 0, // Adjust margin when avatar is present
  },
  receiverWithoutAvatar: {
    marginLeft: 50, // Fixed margin when avatar is not present
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  content: {
    fontSize: 16,
    color: "#000",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
});

export default MessageItemStyle;
