import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";
import React, { memo, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

const PinnedMessage = ({
  receiver,
  pinnedMessages,
  onClose,
  onScrollToMessage,
  setMessages,
}) => {
  const { userInfo } = useContext(AuthContext);

  // Function to unpin recalled messages
  const handleUnPinRecalledMessages = async () => {
    for (const item of pinnedMessages) {
      if (item.isRecall) {
        await api.unPinMessage(item.messageDetailId); // Call the unPinMessage API
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.messageDetailId === item.messageDetailId
              ? { ...msg, isPinned: false, pinnedAt: null }
              : msg
          )
        );
      }
    }
  };

  useEffect(() => {
    handleUnPinRecalledMessages(); // Unpin recalled messages on component mount
  }, [pinnedMessages]);

  // Filter out recalled messages
  const filteredPinnedMessages = pinnedMessages.filter(
    (item) => !item.isRecall
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pinnedMessageContainer}
      onPress={() => {
        onScrollToMessage(item.messageDetailId); // Scroll to the message
        console.log(item.messageDetailId);
        onClose(); // Close modal
      }}
    >
      <Text style={styles.pinnedMessageText}>
        Tin nhắn của{" "}
        {item.senderId === userInfo.userId
          ? userInfo.fullname
          : receiver?.fullname || "Người dùng"}:{" "}
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  const getItemLayout = (data, index) => ({
    length: 50, // Fixed height of each item (change if needed)
    offset: 50 * index,
    index,
  });

  const handleScrollToIndexFailed = (info) => {
    console.warn("Scroll failed: ", info);
    // Handle fallback, e.g., scroll to the nearest position
  };

  return (
    <View style={styles.pinnedContainer}>
      <Text style={styles.pinnedTitle}>
        Tin nhắn đã ghim ({filteredPinnedMessages.length})
      </Text>
      <FlatList
        data={filteredPinnedMessages} // Use filtered messages
        renderItem={renderItem}
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
