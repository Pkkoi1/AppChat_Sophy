import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Inbox = ({ name, message, date }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Chat", { name, message, date })}
      activeOpacity={0.6} // Làm mờ khi nhấn
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        paddingLeft: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "white",
      }}
    >
      <Image
        source={require("../../../assets/images/avt.jpg")}
        style={{ width: 50, height: 50, borderRadius: 25, marginRight: 20 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{name}</Text>
        <Text style={{ color: "gray" }}>{message}</Text>
      </View>
      <Text style={{ color: "gray" }}>{date}</Text>
    </TouchableOpacity>
  );
};

export default Inbox;
