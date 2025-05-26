import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Color from "../../components/colors/Color";

const AiAssistantHistory = ({ navigation, route }) => {
  const {
    conversationHistory,
    handleSelectConversation,
    handleCreateNewConversation,
  } = route.params;

  const formatConversationTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => {
        handleSelectConversation(item);
        navigation.goBack();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle}>
          Cuộc trò chuyện {item.conversationId.slice(0, 8)}
        </Text>
        <Text style={styles.conversationPreview} numberOfLines={1}>
          {item.messages[item.messages.length - 1]?.content ||
            "Không có tin nhắn"}
        </Text>
        <Text style={styles.conversationTime}>
          {formatConversationTime(item.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử trò chuyện</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.createNewButton}
            onPress={() => {
              handleCreateNewConversation();
              navigation.goBack();
            }}
          >
            <Ionicons name="add-circle-outline" size={28} color={Color.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color={Color.white} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={conversationHistory}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={styles.historyList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có lịch sử trò chuyện</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafd",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: Color.sophy,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  createNewButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  historyList: {
    padding: 10,
  },
  conversationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: "#aaa",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
});

export default AiAssistantHistory;
