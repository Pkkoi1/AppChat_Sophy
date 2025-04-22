import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SubMenuStyle from "./SubMenuStyle";
import { useNavigation } from "@react-navigation/native";

const SubMenu = () => {
  const navigation = useNavigation();

  const handleCreateGroupPress = () => {
    navigation.navigate("CreateNewGroup");
  };

  return (
    <TouchableOpacity
      style={SubMenuStyle.menubar}
      onPress={handleCreateGroupPress}
    >
      <View style={SubMenuStyle.menuBarCircle}>
        <AntDesign name="addusergroup" size={24} color="#1b96fd" />
      </View>
      <Text style={SubMenuStyle.menuTitle}>Tạo nhóm mới</Text>
    </TouchableOpacity>
  );
};

export default SubMenu;