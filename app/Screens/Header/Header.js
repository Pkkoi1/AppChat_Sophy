import React, { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { TextInput, View, TouchableOpacity } from "react-native";
import HeaderStyle from "./HeaderStyle";

const HeadView = () => {
  const [search, setSearch] = useState("");

  return (
    <View style={HeaderStyle().container}>
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

      <TouchableOpacity>
        <AntDesign name="qrcode" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity>
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default HeadView;
