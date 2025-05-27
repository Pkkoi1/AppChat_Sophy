import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native"; // Thêm useNavigation

import SubMenuStyle from "./SubMenuStyle";

const subMenuItem = [
  { name: "Lời mời kết bạn", icon: "user-friends" },
  {
    name: "Danh bạ máy",
    icon: "address-book",
    note: "Các liên hệ có dùng Sophy",
  },
  { name: "Sinh nhật", icon: "birthday-cake" },
];

const FriendSubMenu = () => {
  const navigation = useNavigation(); // Khởi tạo navigation

  console.log("[FriendSubMenu] render");

  const handlePress = (itemName) => {
    console.log(`Pressed: ${itemName}`);
    if (itemName === "Lời mời kết bạn") {
      navigation.navigate("ReceivedFriendRequests"); // Điều hướng đến màn hình phù hợp
    }
  };

  return (
    <View style={SubMenuStyle.container}>
      <View style={SubMenuStyle.menubar}>
        {subMenuItem.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[SubMenuStyle.menubarItem]} // Tăng minHeight và căn giữa
            onPress={() => handlePress(item.name)}
            activeOpacity={0.6} // Phản hồi nhấn tốt hơn
          >
            <View style={SubMenuStyle.iconTitleContainer}>
              <View style={SubMenuStyle.iconBackground}>
                <FontAwesome5 name={item.icon} size={16} color="#ffffff" />
              </View>
              <View style={SubMenuStyle.textContainer}>
                <Text style={SubMenuStyle.menuTitle}>
                  {item.name} {item.quantity && `(${item.quantity})`}
                </Text>
                {item.note && (
                  <Text style={SubMenuStyle.menuNote}>{item.note}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default React.memo(FriendSubMenu);
