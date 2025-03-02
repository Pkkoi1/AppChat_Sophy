import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FriendStyle from "./FriendStyle";

const Friends = ({ friend }) => {
  return (
    <View style={FriendStyle.friendItem}>
      <View style={FriendStyle.friendContent}>
        <View style={FriendStyle.imageContainer}>
          <Image
            source={{ uri: friend.avatar }}
            style={FriendStyle.friendImage}
            defaultSource={require("../../../../assets/images/avt.jpg")}
          />
          {friend.status === "online" && (
            <View style={FriendStyle.onlineIndicator} />
          )}
        </View>
        <Text style={FriendStyle.friendName}>{friend.name}</Text>
      </View>
      <View style={FriendStyle.friendActions}>
        <TouchableOpacity style={FriendStyle.friendActionItem}>
          <AntDesign name="phone" size={19} color="grey" />
        </TouchableOpacity>
        <TouchableOpacity style={FriendStyle.friendActionItem}>
          <AntDesign name="videocamera" size={19} color="grey" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Friends;
