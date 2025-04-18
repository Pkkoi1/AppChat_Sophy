import React, { useState } from "react";
import {
  AntDesign,
  Ionicons,
  Octicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { TextInput, View, TouchableOpacity, Text, Alert } from "react-native";
import HeaderStyle from "./HeaderStyle";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../api/api";

const HeadView = ({ page, userInfo }) => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();

  const handleSearch = async () => {
    if (!search || search.trim() === "") {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại cần tìm");
      return;
    }
  
    try {
      setIsSearching(true);
      const phoneNumber = search.trim();
  
      // Gọi API tìm kiếm người dùng theo số điện thoại
      const result = await api.getUserByPhone(phoneNumber);
      console.log("find userrrrrrrrrrrrrrrrrr:", result); // Check the value of result
      if (result) {
        // Lấy danh sách bạn bè, lời mời đã gửi và đã nhận
        let requestSent = "";
        try {
          const friends = await api.getFriends();
          const isFriend = friends.some((f) => f._id === result._id);
          if (isFriend) {
            requestSent = "friend";
          } else {
            const sentRequests = await api.getFriendRequestsSent();
            console.log("sentRequests:", sentRequests); // Check the value of sentRequests
            const isRequestSent = sentRequests.some(
              (sentRequest) => {
                console.log("req.receiverId:", sentRequest.receiverId, "result._id:", result._id);
                return sentRequest.receiverId._id === result._id;
              }
            );
            if (isRequestSent) {
              requestSent = "pending";
            } else {
              const receivedRequests = await api.getFriendRequestsReceived();
              console.log("receivedRequests:", receivedRequests); // Check the value of receivedRequests
              const isRequestReceived = receivedRequests.some(
                (req) => req.senderId._id === result._id
              );
              if (isRequestReceived) {
                requestSent = "accepted";
              }
            }
          }
          console.log("requestSenttttttttttttt:", requestSent); // Check the value of requestSent
        } catch (e) {
          // Nếu lỗi khi lấy danh sách bạn bè, giữ requestSent là ""
          console.error("Lỗi khi kiểm tra bạn bè:", e);
        }
  
        navigation.navigate("UserProfile", {
          friend: result,
          requestSent,
        });
  
        setSearch("");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm người dùng:", error);
      Alert.alert(
        "Không tìm thấy",
        "Không tìm thấy người dùng nào với số điện thoại này",
        [{ text: "Đóng", style: "cancel" }]
      );
    } finally {
      setIsSearching(false);
    }
  };

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
          <TouchableOpacity onPress={handleSearch} disabled={isSearching}>
            <AntDesign name="search1" size={24} color="white" />
          </TouchableOpacity>
          <TextInput
            style={HeaderStyle().searchInput}
            placeholder="Tìm kiếm số điện thoại"
            placeholderTextColor="#ddd"
            value={search}
            onChangeText={setSearch}
            keyboardType="phone-pad"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </>
      )}

      {renderPageIcons()}
    </LinearGradient>
  );
};

export default HeadView;