import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

const PinnedMessage = ({ pinnedMessages, onClose }) => {
  return (
    <View style={styles.pinnedContainer}>
      <Text style={styles.pinnedTitle}>Tin nhắn đã ghim</Text>
      <FlatList
        data={pinnedMessages}
        keyExtractor={(item) => item.messageDetailId}
        renderItem={({ item }) => (
          <View style={styles.pinnedMessageContainer}>
            <Text style={styles.pinnedMessageText}>
              Tin nhắn của {item.senderId}: {item.content}
            </Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pinnedContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  pinnedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pinnedMessageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pinnedMessageText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8d7da",
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#721c24",
    fontWeight: "bold",
  },
});

export default PinnedMessage;
