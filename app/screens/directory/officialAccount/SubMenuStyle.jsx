import React from "react";
import { StyleSheet } from "react-native";

const SubMenuStyle = StyleSheet.create({
  menubar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "left",
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  menuBarCircle: {
    borderRadius: 15,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    backgroundColor: "#e8f6ff",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: "medium",
    marginLeft: 20,
  },
});

export default SubMenuStyle;
