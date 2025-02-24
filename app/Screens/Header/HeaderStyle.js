import React from "react";
import { StyleSheet } from "react-native";

const HeaderStyle = () => {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#1b96fd",
      padding: 10,
      paddingLeft: 20,
      justifyContent: "space-between",
      gap: 10,

      // Đổ bóng cho iOS
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 }, // Đổ bóng xuống dưới
      shadowOpacity: 0.1,
      shadowRadius: 4,

      // Đổ bóng cho Android
      elevation: 6,
    },
    searchInput: {
      flex: 1,
      backgroundColor: "#1b96fd",
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 35,
      marginHorizontal: 10,
      color: "white",
      paddingVertical: 5,
    },
  });
};

export default HeaderStyle;
