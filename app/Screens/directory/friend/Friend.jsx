import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Friends = ({ friend }) => {
  return (
    <View style={styles.friendItem}>
      <View style={styles.friendContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: friend.avatar }}
            style={styles.friendImage}
            defaultSource={require("../../../../assets/images/avt.jpg")}
          />
          {friend.status === "online" && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        <Text style={styles.friendName}>{friend.name}</Text>
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity style={styles.friendActionItem}>
          <AntDesign name="phone" size={19} color="grey" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.friendActionItem}>
          <AntDesign name="videocamera" size={19} color="grey" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  friendItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    paddingBottom: 10,
  },
  friendContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16, // Tăng kích thước
    height: 16,
    backgroundColor: "#34C759",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  friendName: {
    fontSize: 16,
  },
  friendActions: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  friendActionItem: {
    padding: 5,
    borderRadius: 5,
  },
});

export default Friends;