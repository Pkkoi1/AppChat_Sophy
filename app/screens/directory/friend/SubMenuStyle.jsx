import React from "react";
import { StyleSheet } from "react-native";

const SubMenuStyle = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  menubar: {
    display: "flex",
    flexDirection: "column",
    paddingLeft: 10,
  },
  menubarItem: {
    padding: 20,
    borderRadius: 5,
  },
  iconTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 10,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "regular",
  },
  menuNote: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  menubarActive: {
    backgroundColor: "#1b96fd",
    borderRadius: 5,
  },
  iconBackground: {
    backgroundColor: "#1b96fd",
    padding: 4,
    borderRadius: 10,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SubMenuStyle;
