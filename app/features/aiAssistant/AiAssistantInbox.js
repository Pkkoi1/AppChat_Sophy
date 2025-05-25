import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import aiLogo from "../../assets/images/AI.png";

const AiAssistantInbox = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={aiLogo} style={styles.avatar} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          Trợ lý AI
        </Text>
        <Text style={styles.message} numberOfLines={1}>
          Xin chào! Tôi là trợ lý AI. Bạn cần giúp gì?
        </Text>
      </View>
      <Text style={styles.time}>Bây giờ</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: "#666",
  },
  time: {
    fontSize: 12,
    color: "#aaa",
    marginLeft: 8,
  },
});

export default AiAssistantInbox;
