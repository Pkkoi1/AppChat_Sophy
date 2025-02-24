import React from "react";
import { View, Text } from "react-native";

const MessageScreen = ({ route }) => {
  const { name, message, date } = route.params;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>{name}</Text>
      <Text style={{ color: "gray", marginVertical: 5 }}>{date}</Text>
      <Text style={{ fontSize: 16 }}>{message}</Text>
    </View>
  );
};

export default MessageScreen;
