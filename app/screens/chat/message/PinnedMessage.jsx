import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

const PinnedMessage = ({ pinnedMessages, onClose, onScrollToMessage }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pinnedMessageContainer}
      onPress={() => {
        onScrollToMessage(item.messageDetailId); // Cuộn đến tin nhắn
        console.log(item.messageDetailId);
        onClose(); // Đóng modal
      }}
    >
      <Text style={styles.pinnedMessageText}>
        Tin nhắn của {item.senderId}: {item.content}
      </Text>
    </TouchableOpacity>
  );

  const getItemLayout = (data, index) => ({
    length: 50, // Chiều cao cố định của mỗi item (thay đổi nếu cần)
    offset: 50 * index,
    index,
  });

  const handleScrollToIndexFailed = (info) => {
    console.warn("Scroll failed: ", info);
    // Xử lý fallback, ví dụ cuộn đến vị trí gần nhất
  };

  return (
    <View style={styles.pinnedContainer}>
      <Text style={styles.pinnedTitle}>Tin nhắn đã ghim</Text>
      <FlatList
        data={pinnedMessages}
        renderItem={renderItem} // Đảm bảo renderItem là một hàm
        keyExtractor={(item) => item.messageDetailId}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={handleScrollToIndexFailed}
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
