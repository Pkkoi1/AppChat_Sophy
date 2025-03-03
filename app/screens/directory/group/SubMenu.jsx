import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SubMenuStyle from "./SubMenuStyle";

const SubMenu = () => {
  return (
    <TouchableOpacity style={SubMenuStyle.menubar}>
      <View style={SubMenuStyle.menuBarCircle}>
        <AntDesign name="addusergroup" size={24} color="#1b96fd" />
      </View>
      <Text style={SubMenuStyle.menuTitle}>Tạo nhóm mới</Text>
    </TouchableOpacity>
  );
};

export default SubMenu;
