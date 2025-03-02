import React from "react";
import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";

const menuItems = [
  { name: "friends", title: "Bạn bè" },
  { name: "groups", title: "Nhóm" },
  { name: "QA", title: "QA" },
];

const MenuTab = () => {
  return (
    <View style={styles.container}>
      <View style={styles.menubar}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menubarItem}>
            <View key={index}>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
  },
  menubar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  menubarItem: {
    padding: 10,
    borderRadius: 5,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "regular",
    color: "#7f7f7f",
    textAlign: "center",
  },
  menubarActive: {
    backgroundColor: "#1b96fd",
    borderRadius: 5,
  },
});

export default MenuTab;
