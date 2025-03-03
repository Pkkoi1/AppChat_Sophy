import React from "react";
import { StyleSheet } from "react-native";

const FriendStyle = StyleSheet.create({
  friendItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    paddingBottom: 10,
  },
  friendContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: "#34C759",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  friendName: {
    fontSize: 16,
  },
  friendActions: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  friendActionItem: {
    padding: 5,
    borderRadius: 5,
  },
});
export default FriendStyle;
