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
import { LinearGradient } from "expo-linear-gradient";

const HeadView = ({ page, userInfo }) => {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();

  const renderPageIcons = () => {
    switch (page) {
      case "Inbox":
        return (
          <>
            <TouchableOpacity>
              <AntDesign
                name="qrcode"
                size={24}
                color="white"
                onPress={() => navigation.navigate("ScanQR")}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
          </>
        );

      case "Discover":
        return (
          <TouchableOpacity>
            <AntDesign
              name="qrcode"
              size={24}
              color="white"
              onPress={() => navigation.navigate("ScanQR")}
            />
          </TouchableOpacity>
        );

      case "Profile":
      case "ReceivedFriendRequests":
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate("Setting", { userInfo })}
          >
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
    <LinearGradient
      colors={["#1f7bff", "#12bcfa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={HeaderStyle().container}
    >
      {page === "Setting" ? (
        <>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile", { userInfo })}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={HeaderStyle().setting}>Cài đặt</Text>
        </>
      ) : page === "ReceivedFriendRequests" ? (
        <>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={HeaderStyle().setting}>Lời mời kết bạn</Text>
        </>
      ) : page === "VerificationCode" ? (
        <>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={HeaderStyle().setting}>Gửi mã xác thưc</Text>
        </>
      ) : page === "CreateNewPassword" ? (
        <>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={HeaderStyle().setting}>Tạo mật khẩu mới</Text>
        </>
      ) : (
        // Trang chính của ứng dụng
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
    </LinearGradient>
  );
};

export default HeadView;
