import React, { useState } from "react";
import { AntDesign, Ionicons, Octicons, MaterialIcons } from "@expo/vector-icons";
import { TextInput, View, TouchableOpacity } from "react-native";
import HeaderStyle from "./HeaderStyle";

const HeadView = ({ page }) => {
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

      {page === "Inbox" && (
        <>
          <TouchableOpacity>
            <AntDesign name="qrcode" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <AntDesign name="plus" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}


      {page === "Discover" && (
        <>
          <TouchableOpacity>
            <AntDesign name="qrcode" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}
      {page === "Profile" && (
        <TouchableOpacity>
          <AntDesign name="setting" size={24} color="white" />
        </TouchableOpacity>
      )}

      {page === "Diary" && (
        <>
        <TouchableOpacity>
          <MaterialIcons name="add-photo-alternate" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity>
          <MaterialIcons name="notifications" size={24} color="white" />
        </TouchableOpacity>

        
        
        </>
      )}

      {page === "Directory" && (
        <TouchableOpacity>
          <Octicons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HeadView;
