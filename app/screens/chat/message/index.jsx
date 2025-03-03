import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MessageItem = ({ message }) => {
  return (
    <View style={styles.container}>
      {/* Hiển thị thời gian và nội dung tin nhắn */}
      <Text style={styles.timestamp}>{message.timestamp}</Text>
      <Text style={styles.content}>{message.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  content: {
    fontSize: 16,
    color: "#000",
  },
});

export default MessageItem;
