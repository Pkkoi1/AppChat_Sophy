import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";

const ChatHeader = () => {
  const navigation = useNavigation();
  const handlerBack = () => {
    navigation.goBack();
  };
  return (
    <LinearGradient
      colors={["#1f7bff", "#12bcfa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={ChatHeaderStyle.container}
    >
      <TouchableOpacity onPress={handlerBack}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View>
        <Text style={ChatHeaderStyle.text}>Họ Tên</Text>
        <Text style={ChatHeaderStyle.subText}>Vừa mới truy cập</Text>
      </View>

      <TouchableOpacity>
        <Feather name="phone" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="videocam-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="menu-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const ChatHeaderStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 0,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  subText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default ChatHeader;
