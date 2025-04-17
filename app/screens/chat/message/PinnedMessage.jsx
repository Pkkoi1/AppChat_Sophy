import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PinnedMessage = ({ pinnedMessage }) => {
  if (!pinnedMessage || !pinnedMessage.isPinned) return null;

  return (
    <View style={styles.pinnedContainer}>
      <Text style={styles.pinnedText}>
        Tin nhắn của {pinnedMessage.senderId}: {pinnedMessage.content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pinnedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8d7da",
    padding: 10,
    zIndex: 1,
  },
  pinnedText: {
    color: "#721c24",
    fontWeight: "bold",
  },
});

export default PinnedMessage;
