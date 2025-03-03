import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AccountStylse from "./AccountStylse";

const Account = ({ account }) => {
  return (
    <View style={AccountStylse.container}>
      <View style={AccountStylse.avatarContainer}>
        <Image
          source={{ uri: account.officialAccountAvatar }}
          style={AccountStylse.avatar}
        />
        <View style={AccountStylse.checkIcon}>
          <MaterialIcons name="check-circle" size={20} color="#FFA500" />
        </View>
      </View>
      <Text style={AccountStylse.name}>{account.officialAccountName}</Text>
    </View>
  );
};

export default Account;