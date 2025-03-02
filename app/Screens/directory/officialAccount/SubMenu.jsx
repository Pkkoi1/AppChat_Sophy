import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import SubMenuStyle from "./SubMenuStyle";

const SubMenu = () => {
  return (
    <TouchableOpacity style={SubMenuStyle.menubar}>
      <Image
        source={require("../../../../assets/images/images.jpg")}
        style={{ width: 50, height: 50, borderRadius: 25 }}
      />
      <Text style={SubMenuStyle.menuTitle}>Tìm thêm Offical Account</Text>
    </TouchableOpacity>
  );
};

export default SubMenu;