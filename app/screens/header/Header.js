import React, { useState } from "react";
import {
  AntDesign,
  Ionicons,
  Octicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { TextInput, View, TouchableOpacity, Text } from "react-native";
import HeaderStyle from "./HeaderStyle";
import { useNavigation } from "@react-navigation/native";

const HeadView = ({ page }) => {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();

  const renderPageIcons = () => {
    switch (page) {
      case "Inbox":
        return (
          <>
            <TouchableOpacity>
              <AntDesign name="qrcode" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
          </>
        );

      case "Discover":
        return (
          <TouchableOpacity>
            <AntDesign name="qrcode" size={24} color="white" />
          </TouchableOpacity>
        );

      case "Profile":
        return (
          <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
            <AntDesign name="setting" size={24} color="white" />
          </TouchableOpacity>
        );

      case "Diary":
        return (
          <>
            <TouchableOpacity>
              <MaterialIcons
                name="add-photo-alternate"
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialIcons name="notifications" size={24} color="white" />
            </TouchableOpacity>
          </>
        );

      case "Directory":
        return (
          <TouchableOpacity>
            <Octicons name="person-add" size={24} color="white" />
          </TouchableOpacity>
        );

      case "Setting":
        return (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="search-outline" size={24} color="white" />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View style={HeaderStyle().container}>
       {page === "Setting" ? (
        <>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={HeaderStyle().setting}>Cài đặt</Text> 
        </>
      ) : (
        <>
          <TouchableOpacity>
            <AntDesign name="search1" size={24} color="white" />
          </TouchableOpacity>

          <TextInput
            style={HeaderStyle().searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#ddd"
            value={search}
            onChangeText={setSearch}
          />
        </>
      )}

      {renderPageIcons()}
    </View>
  );
};

export default HeadView;
