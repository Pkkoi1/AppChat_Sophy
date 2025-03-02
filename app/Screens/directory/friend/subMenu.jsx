import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const subMenuItem = [
  { name: "Lời mời kết bạn", icon: "user-friends", quantity: 3 },
  {
    name: "Danh bạ máy",
    icon: "address-book",
    note: "Các liên hệ có dùng Zalo",
  },
  { name: "Sinh nhật", icon: "birthday-cake" },
];

const FriendSubMenu = () => {
  return (
    <View style={styles.container}>
      <View style={styles.menubar}>
        {subMenuItem.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menubarItem}>
            <View style={styles.iconTitleContainer}>
              <View style={styles.iconBackground}>
                <FontAwesome5 name={item.icon} size={16} color="#ffffff" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.menuTitle}>
                  {item.name} {item.quantity && `(${item.quantity})`}
                </Text>
                {item.note && <Text style={styles.menuNote}>{item.note}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  menubar: {
    display: "flex",
    flexDirection: "column",
    paddingLeft:10,
  },
  menubarItem: {
    padding: 12,
    borderRadius: 5,
  },
  iconTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 10,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "regular",
  },
  menuNote: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  menubarActive: {
    backgroundColor: "#1b96fd",
    borderRadius: 5,
  },
  iconBackground: {
    backgroundColor: "#1b96fd",
    padding: 4,
    borderRadius: 10,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FriendSubMenu;
