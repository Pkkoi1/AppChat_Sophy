import React from "react";
import { StyleSheet } from "react-native";

const ListFriendStyle = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 0.5,
    padding: 10,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  buttonTab: {
    textAlign: "center",
    width: 100,
    height: 28,
    backgroundColor: "#ddd",
    borderRadius: 18,
    padding: 5,
    paddingHorizontal: 10,
  },
  buttonAll: {
    marginRight: 10,
  },
  buttonNew: {},
  friendList: {
    display: "flex",
    flexDirection: "column",
  },
  buttonContent: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    textAlign: "center",
  },
  friendTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listFriendContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#ffffff",
  },
});

export default ListFriendStyle;
